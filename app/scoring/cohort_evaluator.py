import math

def normal_cdf(x, mean, std):
    """Cumulative normal distribution function."""
    if std <= 0:
        return 50.0
    z = (x - mean) / std
    return 0.5 * (1.0 + math.erf(z / math.sqrt(2.0))) * 100.0

class CohortEvaluator:
    """
    Evaluates physical metrics against Indian Adolescent Cohort Norms.
    Generates explainable scoring and potential indicators.
    """
    # Normative Baselines: (Mean, Std) by [Metric, Gender, AgeBracket]
    NORMS = {
        ("JUMP_HEIGHT_CM", "MALE", "15-16"): (39.0, 7.5),
        ("JUMP_HEIGHT_CM", "FEMALE", "15-16"): (31.5, 6.0),
        ("JUMP_HEIGHT_CM", "MALE", "13-14"): (33.0, 6.5),
        ("JUMP_HEIGHT_CM", "FEMALE", "13-14"): (28.5, 5.5),
        
        ("SQUAT_SYMMETRY_PCT", "MALE", "10-18"): (85.0, 7.0),
        ("SQUAT_SYMMETRY_PCT", "FEMALE", "10-18"): (86.5, 6.5),
        
        ("SPRINT_20M_SEC", "MALE", "15-16"): (3.18, 0.28), # Inverted: Lower is better
        ("SPRINT_20M_SEC", "FEMALE", "15-16"): (3.40, 0.30)
    }

    @classmethod
    def calculate_percentile(cls, metric_code, raw_value, gender="MALE", age=15):
        age_bracket = "15-16" if age >= 15 else "13-14"
        if "SQUAT" in metric_code:
            age_bracket = "10-18"

        key = (metric_code, gender.upper(), age_bracket)
        mean, std = cls.NORMS.get(key, (40.0, 8.0))

        if metric_code == "SPRINT_20M_SEC":
            # For sprint time: lower time -> higher percentile
            z = (mean - raw_value) / std
            pct = 0.5 * (1.0 + math.erf(z / math.sqrt(2.0))) * 100.0
        else:
            pct = normal_cdf(raw_value, mean, std)

        return float(round(max(1.0, min(99.0, pct)), 1))

    @classmethod
    def generate_explainable_assessment(cls, metrics, confidence_score, sport_code="ATHLETICS_SPRINT"):
        """
        metrics: List of { metricCode, metricValue, cohortPercentile, metricUnit }
        """
        strong_indicators = []
        areas_for_verification = []

        scores = [m["cohortPercentile"] for m in metrics]
        overall_score = float(round(sum(scores) / len(scores), 1)) if scores else 70.0

        for m in metrics:
            code = m["metricCode"]
            pct = m["cohortPercentile"]
            val = m["metricValue"]
            unit = m["metricUnit"]

            if pct >= 85.0:
                label_map = {
                    "JUMP_HEIGHT_CM": "Explosive Vertical Power",
                    "TAKEOFF_VELOCITY_MS": "Initial Takeoff Acceleration",
                    "SQUAT_SYMMETRY_PCT": "Bilateral Movement Symmetry",
                    "SPRINT_20M_SEC": "Sprint Acceleration Velocity"
                }
                strong_indicators.append({
                    "metric": code,
                    "percentile": pct,
                    "label": label_map.get(code, code),
                    "valueDescription": f"{val} {unit} (Top {round(100 - pct, 1)}% in Demographic Cohort)"
                })
            elif pct < 60.0:
                areas_for_verification.append({
                    "metric": code,
                    "reason": f"Metric is developing ({val} {unit}, {pct}th percentile)",
                    "suggestedTrialCheck": "Targeted conditioning recommended"
                })

        # False-Negative Safe Potential Bands
        if overall_score >= 80.0 and confidence_score >= 0.75:
            potential_band = "HIGH"
            recommended_action = "Fast-track for District / SAI Physical Verification Trial"
        elif overall_score >= 60.0:
            potential_band = "ABOVE_AVERAGE"
            recommended_action = "Human Scout Review for Regional Verification"
        else:
            potential_band = "DEVELOPING"
            recommended_action = "Foundation training & re-test in 4 weeks"

        return {
            "overallScore": overall_score,
            "potentialBand": potential_band,
            "strongIndicators": strong_indicators,
            "areasForVerification": areas_for_verification,
            "recommendedAction": recommended_action
        }
