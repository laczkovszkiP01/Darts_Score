export const evaluateRound = ({ initialScore, throwsList, outMode }) => {
  let remaining = initialScore;

  for (let i = 0; i < throwsList.length; i += 1) {
    const currentThrow = throwsList[i];
    remaining -= currentThrow.total;

    if (remaining < 0) {
      return {
        bust: true,
        win: false,
        remaining: initialScore,
      };
    }

    if (remaining === 1 && outMode === 'double_out') {
      return {
        bust: true,
        win: false,
        remaining: initialScore,
      };
    }

    if (remaining === 0) {
      if (outMode === 'double_out' && currentThrow.multiplier !== 2) {
        return {
          bust: true,
          win: false,
          remaining: initialScore,
        };
      }

      return {
        bust: false,
        win: true,
        remaining: 0,
      };
    }
  }

  return {
    bust: false,
    win: false,
    remaining,
  };
};
