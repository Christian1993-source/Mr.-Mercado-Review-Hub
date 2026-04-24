(function () {
  "use strict";

  function parseFormula(formula) {
    let i = 0;
    function parseGroup() {
      const counts = {};
      while (i < formula.length) {
        const ch = formula[i];
        if (ch === "(") {
          i += 1;
          const inner = parseGroup();
          const multiplier = parseNumber();
          merge(counts, inner, multiplier);
        } else if (ch === ")") {
          i += 1;
          break;
        } else if (/[A-Z]/.test(ch)) {
          const symbol = parseElement();
          const amount = parseNumber();
          counts[symbol] = (counts[symbol] || 0) + amount;
        } else {
          i += 1;
        }
      }
      return counts;
    }

    function parseElement() {
      const start = i;
      i += 1;
      while (i < formula.length && /[a-z]/.test(formula[i])) i += 1;
      return formula.slice(start, i);
    }

    function parseNumber() {
      const start = i;
      while (i < formula.length && /\d/.test(formula[i])) i += 1;
      if (start === i) return 1;
      return Number(formula.slice(start, i));
    }

    function merge(target, source, factor) {
      Object.entries(source).forEach(([el, value]) => {
        target[el] = (target[el] || 0) + value * factor;
      });
    }

    return parseGroup();
  }

  function computeAtomCounts(reactants, products, coefficients) {
    const left = {};
    const right = {};
    reactants.forEach((formula, idx) => {
      const parsed = parseFormula(formula);
      const coeff = coefficients[idx] || 0;
      Object.entries(parsed).forEach(([el, count]) => {
        left[el] = (left[el] || 0) + count * coeff;
      });
    });
    products.forEach((formula, pIdx) => {
      const parsed = parseFormula(formula);
      const coeff = coefficients[reactants.length + pIdx] || 0;
      Object.entries(parsed).forEach(([el, count]) => {
        right[el] = (right[el] || 0) + count * coeff;
      });
    });
    return { reactants: left, products: right };
  }

  const RAW_EQUATIONS = [
    { type: "synthesis", reactants: ["H2", "O2"], products: ["H2O"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["N2", "H2"], products: ["NH3"], coeff: [1, 3, 2] },
    { type: "synthesis", reactants: ["Na", "Cl2"], products: ["NaCl"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["Fe", "O2"], products: ["Fe2O3"], coeff: [4, 3, 2] },
    { type: "synthesis", reactants: ["Mg", "O2"], products: ["MgO"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["Al", "Cl2"], products: ["AlCl3"], coeff: [2, 3, 2] },
    { type: "synthesis", reactants: ["CaO", "H2O"], products: ["Ca(OH)2"], coeff: [1, 1, 1] },
    { type: "synthesis", reactants: ["SO3", "H2O"], products: ["H2SO4"], coeff: [1, 1, 1] },
    { type: "synthesis", reactants: ["K", "Br2"], products: ["KBr"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["Li", "F2"], products: ["LiF"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["P4", "H2"], products: ["PH3"], coeff: [1, 6, 4] },
    { type: "synthesis", reactants: ["Ca", "O2"], products: ["CaO"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["Na", "O2"], products: ["Na2O"], coeff: [4, 1, 2] },
    { type: "synthesis", reactants: ["H2", "Cl2"], products: ["HCl"], coeff: [1, 1, 2] },
    { type: "synthesis", reactants: ["C", "O2"], products: ["CO2"], coeff: [1, 1, 1] },
    { type: "synthesis", reactants: ["C", "O2"], products: ["CO"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["NO", "O2"], products: ["NO2"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["SO2", "O2"], products: ["SO3"], coeff: [2, 1, 2] },
    { type: "synthesis", reactants: ["Fe", "Cl2"], products: ["FeCl3"], coeff: [2, 3, 2] },
    { type: "synthesis", reactants: ["Cu", "O2"], products: ["CuO"], coeff: [2, 1, 2] },

    { type: "decomposition", reactants: ["H2O2"], products: ["H2O", "O2"], coeff: [2, 2, 1] },
    { type: "decomposition", reactants: ["KClO3"], products: ["KCl", "O2"], coeff: [2, 2, 3] },
    { type: "decomposition", reactants: ["CaCO3"], products: ["CaO", "CO2"], coeff: [1, 1, 1] },
    { type: "decomposition", reactants: ["NaN3"], products: ["Na", "N2"], coeff: [2, 2, 3] },
    { type: "decomposition", reactants: ["HgO"], products: ["Hg", "O2"], coeff: [2, 2, 1] },
    { type: "decomposition", reactants: ["Al2O3"], products: ["Al", "O2"], coeff: [2, 4, 3] },
    { type: "decomposition", reactants: ["H2O"], products: ["H2", "O2"], coeff: [2, 2, 1] },
    { type: "decomposition", reactants: ["NH3"], products: ["N2", "H2"], coeff: [2, 1, 3] },
    { type: "decomposition", reactants: ["NaCl"], products: ["Na", "Cl2"], coeff: [2, 2, 1] },
    { type: "decomposition", reactants: ["KBr"], products: ["K", "Br2"], coeff: [2, 2, 1] },
    { type: "decomposition", reactants: ["Ag2O"], products: ["Ag", "O2"], coeff: [2, 4, 1] },
    { type: "decomposition", reactants: ["PbO2"], products: ["PbO", "O2"], coeff: [2, 2, 1] },
    { type: "decomposition", reactants: ["Fe(OH)3"], products: ["Fe2O3", "H2O"], coeff: [2, 1, 3] },
    { type: "decomposition", reactants: ["NaHCO3"], products: ["Na2CO3", "CO2", "H2O"], coeff: [2, 1, 1, 1] },
    { type: "decomposition", reactants: ["(NH4)2Cr2O7"], products: ["Cr2O3", "N2", "H2O"], coeff: [1, 1, 1, 4] },
    { type: "decomposition", reactants: ["CaCO3"], products: ["CaO", "CO2"], coeff: [2, 2, 2] },
    { type: "decomposition", reactants: ["HNO3"], products: ["NO2", "H2O", "O2"], coeff: [4, 4, 2, 1] },
    { type: "decomposition", reactants: ["KNO3"], products: ["KNO2", "O2"], coeff: [2, 2, 1] },
    { type: "decomposition", reactants: ["NaNO3"], products: ["NaNO2", "O2"], coeff: [2, 2, 1] },
    { type: "decomposition", reactants: ["Pb(NO3)2"], products: ["PbO", "NO2", "O2"], coeff: [2, 2, 4, 1] },

    { type: "single replacement", reactants: ["Zn", "HCl"], products: ["ZnCl2", "H2"], coeff: [1, 2, 1, 1] },
    { type: "single replacement", reactants: ["Fe", "CuSO4"], products: ["FeSO4", "Cu"], coeff: [1, 1, 1, 1] },
    { type: "single replacement", reactants: ["Al", "CuCl2"], products: ["AlCl3", "Cu"], coeff: [2, 3, 2, 3] },
    { type: "single replacement", reactants: ["Cl2", "KI"], products: ["KCl", "I2"], coeff: [1, 2, 2, 1] },
    { type: "single replacement", reactants: ["Mg", "H2O"], products: ["Mg(OH)2", "H2"], coeff: [1, 2, 1, 1] },
    { type: "single replacement", reactants: ["Ca", "H2O"], products: ["Ca(OH)2", "H2"], coeff: [1, 2, 1, 1] },
    { type: "single replacement", reactants: ["Na", "H2O"], products: ["NaOH", "H2"], coeff: [2, 2, 2, 1] },
    { type: "single replacement", reactants: ["Br2", "NaI"], products: ["NaBr", "I2"], coeff: [1, 2, 2, 1] },
    { type: "single replacement", reactants: ["K", "H2O"], products: ["KOH", "H2"], coeff: [2, 2, 2, 1] },
    { type: "single replacement", reactants: ["Mg", "FeCl3"], products: ["MgCl2", "Fe"], coeff: [3, 2, 3, 2] },
    { type: "single replacement", reactants: ["Al", "Fe2O3"], products: ["Al2O3", "Fe"], coeff: [2, 1, 1, 2] },
    { type: "single replacement", reactants: ["Zn", "Cu(NO3)2"], products: ["Zn(NO3)2", "Cu"], coeff: [1, 1, 1, 1] },
    { type: "single replacement", reactants: ["Fe", "HCl"], products: ["FeCl2", "H2"], coeff: [1, 2, 1, 1] },
    { type: "single replacement", reactants: ["Fe", "CuSO4"], products: ["Fe2(SO4)3", "Cu"], coeff: [2, 3, 1, 3] },
    { type: "single replacement", reactants: ["Ni", "AgNO3"], products: ["Ni(NO3)2", "Ag"], coeff: [1, 2, 1, 2] },
    { type: "single replacement", reactants: ["Pb", "AgNO3"], products: ["Pb(NO3)2", "Ag"], coeff: [1, 2, 1, 2] },
    { type: "single replacement", reactants: ["Cu", "AgNO3"], products: ["Cu(NO3)2", "Ag"], coeff: [1, 2, 1, 2] },
    { type: "single replacement", reactants: ["Al", "H2SO4"], products: ["Al2(SO4)3", "H2"], coeff: [2, 3, 1, 3] },
    { type: "single replacement", reactants: ["Na", "HCl"], products: ["NaCl", "H2"], coeff: [2, 2, 2, 1] },
    { type: "single replacement", reactants: ["Ca", "HCl"], products: ["CaCl2", "H2"], coeff: [1, 2, 1, 1] },

    { type: "double replacement", reactants: ["AgNO3", "NaCl"], products: ["AgCl", "NaNO3"], coeff: [1, 1, 1, 1] },
    { type: "double replacement", reactants: ["BaCl2", "Na2SO4"], products: ["BaSO4", "NaCl"], coeff: [1, 1, 1, 2] },
    { type: "double replacement", reactants: ["Pb(NO3)2", "KI"], products: ["PbI2", "KNO3"], coeff: [1, 2, 1, 2] },
    { type: "double replacement", reactants: ["HCl", "NaOH"], products: ["NaCl", "H2O"], coeff: [1, 1, 1, 1] },
    { type: "double replacement", reactants: ["H2SO4", "NaOH"], products: ["Na2SO4", "H2O"], coeff: [1, 2, 1, 2] },
    { type: "double replacement", reactants: ["CaCl2", "Na2CO3"], products: ["CaCO3", "NaCl"], coeff: [1, 1, 1, 2] },
    { type: "double replacement", reactants: ["FeCl3", "NaOH"], products: ["Fe(OH)3", "NaCl"], coeff: [1, 3, 1, 3] },
    { type: "double replacement", reactants: ["Al2(SO4)3", "Ca(OH)2"], products: ["Al(OH)3", "CaSO4"], coeff: [1, 3, 2, 3] },
    { type: "double replacement", reactants: ["H3PO4", "Ca(OH)2"], products: ["Ca3(PO4)2", "H2O"], coeff: [2, 3, 1, 6] },
    { type: "double replacement", reactants: ["Na2S", "HCl"], products: ["NaCl", "H2S"], coeff: [1, 2, 2, 1] },
    { type: "double replacement", reactants: ["K2CO3", "HNO3"], products: ["KNO3", "H2O", "CO2"], coeff: [1, 2, 2, 1, 1] },
    { type: "double replacement", reactants: ["Na2CO3", "HCl"], products: ["NaCl", "H2O", "CO2"], coeff: [1, 2, 2, 1, 1] },
    { type: "double replacement", reactants: ["Ba(OH)2", "HCl"], products: ["BaCl2", "H2O"], coeff: [1, 2, 1, 2] },
    { type: "double replacement", reactants: ["CuSO4", "NaOH"], products: ["Cu(OH)2", "Na2SO4"], coeff: [1, 2, 1, 1] },
    { type: "double replacement", reactants: ["AgNO3", "CaCl2"], products: ["AgCl", "Ca(NO3)2"], coeff: [2, 1, 2, 1] },
    { type: "double replacement", reactants: ["BaCl2", "Na3PO4"], products: ["Ba3(PO4)2", "NaCl"], coeff: [3, 2, 1, 6] },
    { type: "double replacement", reactants: ["FeSO4", "NaOH"], products: ["Fe(OH)2", "Na2SO4"], coeff: [1, 2, 1, 1] },
    { type: "double replacement", reactants: ["NH4Cl", "NaOH"], products: ["NH3", "NaCl", "H2O"], coeff: [1, 1, 1, 1, 1] },
    { type: "double replacement", reactants: ["Na3PO4", "KOH"], products: ["NaOH", "K3PO4"], coeff: [1, 3, 3, 1] },
    { type: "double replacement", reactants: ["Ca(OH)2", "NH4Cl"], products: ["CaCl2", "NH3", "H2O"], coeff: [1, 2, 1, 2, 2] },

    { type: "combustion", reactants: ["CH4", "O2"], products: ["CO2", "H2O"], coeff: [1, 2, 1, 2] },
    { type: "combustion", reactants: ["C2H6", "O2"], products: ["CO2", "H2O"], coeff: [2, 7, 4, 6] },
    { type: "combustion", reactants: ["C3H8", "O2"], products: ["CO2", "H2O"], coeff: [1, 5, 3, 4] },
    { type: "combustion", reactants: ["C4H10", "O2"], products: ["CO2", "H2O"], coeff: [2, 13, 8, 10] },
    { type: "combustion", reactants: ["C2H5OH", "O2"], products: ["CO2", "H2O"], coeff: [1, 3, 2, 3] },
    { type: "combustion", reactants: ["CH3OH", "O2"], products: ["CO2", "H2O"], coeff: [2, 3, 2, 4] },
    { type: "combustion", reactants: ["C6H12O6", "O2"], products: ["CO2", "H2O"], coeff: [1, 6, 6, 6] },
    { type: "combustion", reactants: ["C2H2", "O2"], products: ["CO2", "H2O"], coeff: [2, 5, 4, 2] },
    { type: "combustion", reactants: ["C7H16", "O2"], products: ["CO2", "H2O"], coeff: [1, 11, 7, 8] },
    { type: "combustion", reactants: ["C8H18", "O2"], products: ["CO2", "H2O"], coeff: [2, 25, 16, 18] },
    { type: "combustion", reactants: ["C9H20", "O2"], products: ["CO2", "H2O"], coeff: [1, 14, 9, 10] },
    { type: "combustion", reactants: ["C10H22", "O2"], products: ["CO2", "H2O"], coeff: [2, 31, 20, 22] },
    { type: "combustion", reactants: ["C6H6", "O2"], products: ["CO2", "H2O"], coeff: [2, 15, 12, 6] },
    { type: "combustion", reactants: ["C2H4", "O2"], products: ["CO2", "H2O"], coeff: [1, 3, 2, 2] },
    { type: "combustion", reactants: ["C3H6", "O2"], products: ["CO2", "H2O"], coeff: [2, 9, 6, 6] },
    { type: "combustion", reactants: ["C4H8", "O2"], products: ["CO2", "H2O"], coeff: [1, 6, 4, 4] },
    { type: "combustion", reactants: ["C5H12", "O2"], products: ["CO2", "H2O"], coeff: [2, 16, 10, 12] },
    { type: "combustion", reactants: ["C12H26", "O2"], products: ["CO2", "H2O"], coeff: [2, 37, 24, 26] },
    { type: "combustion", reactants: ["C3H8O", "O2"], products: ["CO2", "H2O"], coeff: [2, 9, 6, 8] },
    { type: "combustion", reactants: ["C2H6O", "O2"], products: ["CO2", "H2O"], coeff: [1, 3, 2, 3] }
  ];

  const EQUATION_BANK = RAW_EQUATIONS.map((entry, idx) => {
    const reactants = entry.reactants.slice();
    const products = entry.products.slice();
    const coefficients = entry.coeff.slice();
    const display = `${reactants.map((r) => `□ ${r}`).join(" + ")} → ${products.map((p) => `□ ${p}`).join(" + ")}`;
    return {
      id: idx + 1,
      type: entry.type,
      reactants,
      products,
      display,
      correctCoefficients: coefficients,
      atomCounts: computeAtomCounts(reactants, products, coefficients)
    };
  });

  window.EQUATION_BANK = EQUATION_BANK;
  window.parseFormulaCounts = parseFormula;
})();
