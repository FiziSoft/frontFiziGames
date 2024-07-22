export default [
    {
      target: '.team-name', // Селектор элемента, на который указывает шаг
      content: 'Это название команды. Здесь вы увидите прогресс команды.',
      params: {
        placement: 'bottom' // Положение подсказки
      }
    },
    {
      target: '.grid',
      content: 'Здесь отображаются слова, которые нужно угадать.',
      params: {
        placement: 'top'
      }
    },
    {
      target: '.btn-grad',
      content: 'Используйте эти кнопки для управления игрой.',
      params: {
        placement: 'bottom'
      }
    }
  ];
  