import math
import numpy as np

class OneEuroFilter:
    """
    1€ Filter: Adaptive Low-Pass Filter for Jitter Reduction & Fast Dynamic Response.
    Reference: Casiez et al., CHI 2012.
    """
    def __init__(self, t0, x0, min_cutoff=1.0, beta=0.007, d_cutoff=1.0):
        self.min_cutoff = float(min_cutoff)
        self.beta = float(beta)
        self.d_cutoff = float(d_cutoff)
        self.x_prev = float(x0)
        self.dx_prev = 0.0
        self.t_prev = float(t0)

    def _alpha(self, cutoff, dt):
        tau = 1.0 / (2.0 * math.pi * cutoff)
        return 1.0 / (1.0 + tau / dt)

    def filter(self, t, x):
        dt = t - self.t_prev
        if dt <= 0.0:
            return self.x_prev

        # Estimate rate of change (derivative)
        d_val = (x - self.x_prev) / dt
        a_d = self._alpha(self.d_cutoff, dt)
        dx_hat = a_d * d_val + (1.0 - a_d) * self.dx_prev

        # Adaptive cutoff frequency
        cutoff = self.min_cutoff + self.beta * abs(dx_hat)
        a = self._alpha(cutoff, dt)
        x_hat = a * x + (1.0 - a) * self.x_prev

        self.x_prev = x_hat
        self.dx_prev = dx_hat
        self.t_prev = t
        return x_hat


class PoseSmoother:
    """
    Applies 1€ smoothing across all (x, y, z) 3D landmark trajectories.
    """
    def __init__(self, min_cutoff=1.0, beta=0.005):
        self.filters = {} # key: (landmark_idx, coord) -> OneEuroFilter
        self.min_cutoff = min_cutoff
        self.beta = beta

    def smooth_frame(self, timestamp_sec, landmarks_dict):
        """
        landmarks_dict: { idx: (x, y, z, visibility) }
        returns smoothed { idx: (x, y, z, visibility) }
        """
        smoothed = {}
        for idx, (x, y, z, vis) in landmarks_dict.items():
            if vis < 0.3:
                smoothed[idx] = (x, y, z, vis)
                continue

            for coord_name, val in [("x", x), ("y", y), ("z", z)]:
                key = (idx, coord_name)
                if key not in self.filters:
                    self.filters[key] = OneEuroFilter(timestamp_sec, val, self.min_cutoff, self.beta)
                    smoothed_val = val
                else:
                    smoothed_val = self.filters[key].filter(timestamp_sec, val)

                if coord_name == "x":
                    sx = smoothed_val
                elif coord_name == "y":
                    sy = smoothed_val
                elif coord_name == "z":
                    sz = smoothed_val

            smoothed[idx] = (sx, sy, sz, vis)
        return smoothed
