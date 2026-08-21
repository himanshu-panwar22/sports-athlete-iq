# AI & Biomechanical Methodology Specification

## 1. Biomechanical Kinematics Formulations

### 1.1 Countermovement Vertical Jump (Flight-Time Model)
Traditional smartphone video analysis often fails when relying solely on pixel displacement because perspective distortion, optical zoom, and variable athlete-to-camera distances distort the measurement.

The platform utilizes **Air Flight Time Physics** as the primary invariant metric:

```
Takeoff Frame: $t_1$ (Toes leave ground contact)
Landing Frame: $t_2$ (First point of foot re-contact)
Flight Time: $\Delta t = \frac{t_2 - t_1}{\text{FPS}}$
```

Under uniform gravitational acceleration ($g = 9.80665\,\text{m/s}^2$), assuming takeoff and landing heights are symmetrical:
$$h_{\text{gravity}} = \frac{1}{8} g (\Delta t)^2$$

**Takeoff Velocity ($v_0$):**
$$v_0 = g \cdot \frac{\Delta t}{2} = \frac{1}{2} g \Delta t$$

**Direct Optical Displacement Fusion ($h_{\text{fused}}$):**
$$h_{\text{cv}} = (y_{\text{base}} - y_{\text{apex}}) \times S_{\text{cm/px}}$$
$$h_{\text{fused}} = 0.70 \cdot h_{\text{gravity}} + 0.30 \cdot h_{\text{cv}}$$

---

### 1.2 Squat Joint Angle Flexion & Bilateral Symmetry Model
For knee joint angle $\theta_{\text{knee}}$, we compute the 3D angle formed by the hip joint ($P_{\text{hip}}$), knee joint ($P_{\text{knee}}$), and ankle joint ($P_{\text{ankle}}$):

$$\vec{a} = P_{\text{hip}} - P_{\text{knee}}, \quad \vec{b} = P_{\text{ankle}} - P_{\text{knee}}$$
$$\theta_{\text{knee}} = \arccos\left(\frac{\vec{a} \cdot \vec{b}}{\|\vec{a}\| \|\vec{b}\|}\right) \times \frac{180^\circ}{\pi}$$

**Repetition Counting Finite State Machine:**
1. `STANDING`: $\theta_{\text{knee}} \ge 160^\circ$
2. `DESCENDING`: $\theta_{\text{knee}} < 140^\circ$
3. `BOTTOM (Parallel Depth Achieved)`: $\theta_{\text{knee}} \le 90^\circ$
4. `ASCENDING`: $\theta_{\text{knee}} > 110^\circ$
5. `LOCKOUT`: $\theta_{\text{knee}} \ge 160^\circ \longrightarrow \text{Rep Count} \mathrel{+}= 1$

**Bilateral Movement Symmetry Index ($S_{\text{sym}}$):**
$$S_{\text{sym}} = 100 \times \left(1 - \frac{|\theta_{\text{knee, left}} - \theta_{\text{knee, right}}|}{180^\circ}\right)$$

---

## 2. Adaptive Temporal Smoothing (1€ Filter)
Low-cost budget smartphones suffer from optical sensor noise and fluctuating frame intervals. We apply the **One-Euro ($1\text{€}$) Filter** (Casiez et al.):

$$\alpha(f_c, \Delta t) = \frac{1}{1 + \frac{1}{2\pi f_c \Delta t}}$$
$$f_c = f_{c,\min} + \beta |\hat{\dot{x}}_i|$$
$$\hat{x}_i = \alpha \cdot x_i + (1 - \alpha) \cdot \hat{x}_{i-1}$$

* Low movement velocity $\longrightarrow$ low cutoff frequency $f_c \longrightarrow$ heavy jitter filtering.
* High movement velocity $\longrightarrow$ high cutoff frequency $f_c \longrightarrow$ zero lag during rapid athletic takeoff.

---

## 3. Real-World Metric Scale Calibration

### 3.1 Optical ArUco Reference Marker
An optical marker ($15 \times 15\,\text{cm}$) is placed flat in the movement plane.
$$W_{\text{px}} = \frac{\|P_1 - P_0\| + \|P_2 - P_3\|}{2}$$
$$S_{\text{cm/px}} = \frac{15.0\,\text{cm}}{W_{\text{px}}}$$

### 3.2 Athlete Standing Height Fallback
$$S_{\text{fallback}} = \frac{\text{Athlete Height (cm)}}{|y_{\text{ankle}} - y_{\text{head}}| \times \text{Resolution Height}}$$
*(Reduces calibration confidence factor from 1.0 to 0.75).*

---

## 4. Multi-Factor Confidence Scoring Formula

$$C = W_q \cdot Q_{\text{video}} + W_p \cdot P_{\text{vis}} + W_c \cdot C_{\text{calib}} + W_a \cdot S_{\text{agreement}}$$

| Factor | Weight | Evaluation Method |
| :--- | :--- | :--- |
| **$Q_{\text{video}}$ (Video Quality)** | $0.25$ | Luminance histogram balance ($70 \le \mu \le 200$) + frame continuity |
| **$P_{\text{vis}}$ (Pose Visibility)** | $0.35$ | Landmark detection ratio across required joints $\ge 0.90$ |
| **$C_{\text{calib}}$ (Calibration)** | $0.20$ | $1.0$ (ArUco marker) or $0.75$ (Body height fallback) |
| **$S_{\text{agreement}}$ (Kinematics)** | $0.20$ | Correlation between gravity flight time and apex displacement |

---

## 5. Indian Adolescent Cohort Percentile Mapper
Raw metrics are mapped to percentiles using standard normal cumulative distribution $\Phi(z)$ parameterised by gender and age brackets (10–12, 13–14, 15–16, 17–18):

$$\text{Percentile} = \Phi\left(\frac{x - \mu_{\text{cohort}}}{\sigma_{\text{cohort}}}\right) \times 100$$
$$\Phi(z) = \frac{1}{2}\left[1 + \text{erf}\left(\frac{z}{\sqrt{2}}\right)\right]$$
