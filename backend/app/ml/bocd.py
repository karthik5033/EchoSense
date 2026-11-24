import numpy as np
from scipy import stats as sp_stats
from typing import Dict, Any, List, Tuple

class BOCDetector:
    """
    Bayesian Online Changepoint Detection (Adams & MacKay, 2007)
    with Normal-Inverse-Gamma (NIG) conjugate priors for real-time
    detection of structural acoustic precursors and regime shifts.
    """
    def __init__(
        self,
        hazard_lambda: float = 150.0,
        mu0: float = 0.0,
        kappa0: float = 1.0,
        alpha0: float = 1.0,
        beta0: float = 1.0,
        alarm_threshold: float = 0.65
    ):
        self.hazard = 1.0 / float(hazard_lambda)
        self.mu0 = mu0
        self.kappa0 = kappa0
        self.alpha0 = alpha0
        self.beta0 = beta0
        self.alarm_threshold = alarm_threshold

        # Posterior tracking state
        self.R = np.array([1.0], dtype=np.float64)  # P(r_0 = 0) = 1
        self.mu_params = np.array([mu0], dtype=np.float64)
        self.kappa_params = np.array([kappa0], dtype=np.float64)
        self.alpha_params = np.array([alpha0], dtype=np.float64)
        self.beta_params = np.array([beta0], dtype=np.float64)

        self.history_changepoint_probs: List[float] = []
        self.history_map_run_lengths: List[int] = []
        self.alarm_triggered_steps: List[int] = []
        self.step_count = 0

    def update(self, x: float) -> Tuple[float, int, bool]:
        """
        Processes a single acoustic streaming observation x_t (e.g. persistent entropy or RMS energy).
        Returns:
            changepoint_prob: P(r_t = 0 | x_{1:t})
            map_run_length: argmax_r P(r_t = r | x_{1:t})
            is_alarm: True if changepoint_prob > alarm_threshold
        """
        # 1. Evaluate predictive distribution (Student's t-distribution) for each active run length
        df = 2.0 * self.alpha_params
        loc = self.mu_params
        scale = np.sqrt((self.beta_params * (self.kappa_params + 1.0)) / (self.alpha_params * self.kappa_params))
        scale = np.maximum(scale, 1e-6)

        pred_probs = sp_stats.t.pdf(x, df=df, loc=loc, scale=scale)
        pred_probs = np.maximum(pred_probs, 1e-12)

        # 2. Calculate growth probabilities
        growth_probs = self.R * pred_probs * (1.0 - self.hazard)

        # 3. Calculate changepoint probability (reset to run length 0)
        cp_prob = np.sum(self.R * pred_probs * self.hazard)

        # 4. Construct new run length distribution vector [cp_prob, growth_probs...]
        new_R = np.empty(len(growth_probs) + 1, dtype=np.float64)
        new_R[0] = cp_prob
        new_R[1:] = growth_probs

        # 5. Normalize
        total_evidence = np.sum(new_R)
        if total_evidence > 0:
            new_R = new_R / total_evidence
        else:
            new_R = np.zeros_like(new_R)
            new_R[0] = 1.0

        self.R = new_R

        # 6. Update hyper-parameters for run lengths r+1
        new_kappa = np.empty(len(self.kappa_params) + 1, dtype=np.float64)
        new_kappa[0] = self.kappa0
        new_kappa[1:] = self.kappa_params + 1.0

        new_mu = np.empty(len(self.mu_params) + 1, dtype=np.float64)
        new_mu[0] = self.mu0
        new_mu[1:] = (self.kappa_params * self.mu_params + x) / new_kappa[1:]

        new_alpha = np.empty(len(self.alpha_params) + 1, dtype=np.float64)
        new_alpha[0] = self.alpha0
        new_alpha[1:] = self.alpha_params + 0.5

        new_beta = np.empty(len(self.beta_params) + 1, dtype=np.float64)
        new_beta[0] = self.beta0
        new_beta[1:] = self.beta_params + (self.kappa_params * (x - self.mu_params)**2) / (2.0 * (self.kappa_params + 1.0))

        # Truncate posterior representation to top 150 run lengths to cap memory & runtime
        if len(self.R) > 150:
            top_indices = np.argsort(self.R)[::-1][:150]
            top_indices = np.sort(top_indices)
            self.R = self.R[top_indices]
            self.R /= np.sum(self.R)
            self.mu_params = new_mu[top_indices]
            self.kappa_params = new_kappa[top_indices]
            self.alpha_params = new_alpha[top_indices]
            self.beta_params = new_beta[top_indices]
        else:
            self.mu_params = new_mu
            self.kappa_params = new_kappa
            self.alpha_params = new_alpha
            self.beta_params = new_beta

        cp_normalized = float(self.R[0])
        map_rl = int(np.argmax(self.R))
        is_alarm = bool(cp_normalized >= self.alarm_threshold)

        self.history_changepoint_probs.append(round(cp_normalized, 4))
        self.history_map_run_lengths.append(map_rl)
        if is_alarm:
            self.alarm_triggered_steps.append(self.step_count)

        self.step_count += 1
        return cp_normalized, map_rl, is_alarm

def run_bocd_on_stream(
    series: np.ndarray,
    hazard_lambda: float = 150.0,
    alarm_threshold: float = 0.65
) -> Dict[str, Any]:
    """
    Executes Adams & MacKay BOCD on a univariate acoustic feature sequence
    (e.g., persistent entropy stream or energy bursts over time).
    """
    if len(series) == 0:
        return {
            "total_steps": 0,
            "alarm_steps": [],
            "changepoint_probabilities": [],
            "map_run_lengths": [],
            "alarm_triggered": False
        }

    # Initialize hyper-parameters from the baseline first 10 samples
    init_sample = series[:min(10, len(series))]
    mu0 = float(np.mean(init_sample))
    var0 = float(np.var(init_sample)) if len(init_sample) > 1 else 1.0
    var0 = max(var0, 1e-4)

    detector = BOCDetector(
        hazard_lambda=hazard_lambda,
        mu0=mu0,
        kappa0=1.0,
        alpha0=1.0,
        beta0=var0,
        alarm_threshold=alarm_threshold
    )

    for val in series:
        detector.update(float(val))

    alarm_active = len(detector.alarm_triggered_steps) > 0
    max_cp_prob = float(max(detector.history_changepoint_probs)) if detector.history_changepoint_probs else 0.0

    return {
        "total_steps": len(series),
        "alarm_steps": detector.alarm_triggered_steps,
        "changepoint_probabilities": detector.history_changepoint_probs,
        "map_run_lengths": detector.history_map_run_lengths,
        "alarm_triggered": alarm_active,
        "max_changepoint_prob": round(max_cp_prob, 4),
        "hazard_rate": round(detector.hazard, 5)
    }
