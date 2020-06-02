export const getTempCode = (temperature: number): string => {
  switch (temperature) {
    case 15.0:
      return '02H';
    case 15.5:
      return '03H';
    case 16.0:
      return '04H';
    case 16.5:
      return '05H';
    case 17.0:
      return '06H';
    case 17.5:
      return '07H';
    case 18.0:
      return '08H';
    case 18.5:
      return '09H';
    case 19.0:
      return '0AH';
    case 19.5:
      return '0BH';
    case 20.0:
      return '0CH';
    case 20.5:
      return '0DH';
    case 21.0:
      return '0EH';
    case 21.5:
      return '0FH';
    case 22.0:
      return '10H';
    case 22.5:
      return '11H';
    case 23.0:
      return '12H';
    case 23.5:
      return '13H';
    case 24.0:
      return '14H';
    case 24.5:
      return '15H';
    case 25.0:
      return '16H';
    case 25.5:
      return '17H';
    case 26.0:
      return '18H';
    case 26.5:
      return '19H';
    case 27.0:
      return '1AH';
    case 27.5:
      return '1BH';
    case 28.0:
      return '1CH';
    case 28.5:
      return '1DH';
    case 29.0:
      return '1EH';
    case 29.5:
      return '1FH';
    case 30.0:
      return '20H';
    default:
      throw new Error('temperature out of bounds! min: 15.0* max: 30*, max step: 0.5');
  }
};
