from decimal import Decimal
from typing import Any

def to_decimal(val: Any) -> Decimal:
    if val is None:
        return Decimal(0)
    try:
        return Decimal(str(val))
    except (ValueError, TypeError):
        return Decimal(0)

def calc_kpis(cycle: Any) -> None:
    # Safely get variables
    hectares = to_decimal(cycle.hectares)
    animals_seeded = to_decimal(cycle.animals_seeded)
    days = to_decimal(cycle.days)
    lbs_trawl_plant = to_decimal(cycle.lbs_trawl_plant)
    lbs_harvest_plant = to_decimal(cycle.lbs_harvest_plant)
    lbs_trawl_farm = to_decimal(cycle.lbs_trawl_farm)
    lbs_harvest_farm = to_decimal(cycle.lbs_harvest_farm)
    gr_trawl_plant = to_decimal(cycle.gr_trawl_plant)
    gr_harvest_plant = to_decimal(cycle.gr_harvest_plant)
    gr_trawl_farm = to_decimal(cycle.gr_trawl_farm)
    gr_harvest_farm = to_decimal(cycle.gr_harvest_farm)
    animals_trawl = to_decimal(cycle.animals_trawl)
    feed_lbs = to_decimal(cycle.feed_lbs)

    # 1. Seeding Type
    lab = cycle.laboratory or ""
    cycle.seeding_type = "COMBINADO" if "/" in str(lab) else "UNICO"

    # 2. Density
    if hectares > 0:
        cycle.density_ha = animals_seeded / hectares
        cycle.density_m2 = cycle.density_ha / Decimal(10000)
    else:
        cycle.density_ha = Decimal(0)
        cycle.density_m2 = Decimal(0)

    # 3. Total Libras
    cycle.total_lbs = lbs_trawl_plant + lbs_harvest_plant

    # 4. LBS/HA
    if hectares > 0:
        cycle.lbs_ha = cycle.total_lbs / hectares
    else:
        cycle.lbs_ha = Decimal(0)

    # 5. Animals Cosechados (Harvested)
    if gr_harvest_plant > 0:
        cycle.animals_harvest = (lbs_harvest_plant * Decimal(454)) / gr_harvest_plant
    else:
        cycle.animals_harvest = Decimal(0)

    # 6. Total Animals
    cycle.total_animals = animals_trawl + to_decimal(cycle.animals_harvest)

    # 7. Survival Pct
    if animals_seeded > 0:
        cycle.survival_pct = (cycle.total_animals / animals_seeded) * Decimal(100)
    else:
        cycle.survival_pct = Decimal(0)

    # 8. LBS/HA/DIA
    if days > 0:
        cycle.lbs_ha_day = cycle.lbs_ha / days
    else:
        cycle.lbs_ha_day = Decimal(0)

    # 9. Weekly Increment
    if days > 0:
        cycle.weekly_increment = gr_harvest_plant / (days / Decimal(7))
    else:
        cycle.weekly_increment = Decimal(0)

    # 10. KG/HA (Balanced food in Kg per Hectare per Day)
    if hectares > 0 and days > 0:
        cycle.kg_ha = ((feed_lbs / Decimal("2.2046")) / hectares) / days
    else:
        cycle.kg_ha = Decimal(0)

    # 11. FCA (Food Conversion Rate)
    if cycle.total_lbs > 0:
        cycle.fca = feed_lbs / cycle.total_lbs
    else:
        cycle.fca = Decimal(0)

    # 12. Differences (QC)
    cycle.diff_trawl_lbs = lbs_trawl_plant - lbs_trawl_farm
    cycle.diff_harvest_lbs = lbs_harvest_plant - lbs_harvest_farm
    cycle.diff_trawl_gr = gr_trawl_plant - gr_trawl_farm
    cycle.diff_harvest_gr = gr_harvest_plant - gr_harvest_farm
