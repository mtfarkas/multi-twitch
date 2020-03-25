(function() {
  let inputs;
  let startBtn;
  const urlRegex = new RegExp(`^https?:\\/\\/(www\\.)?twitch\\.tv\\/videos\\/\\d+$`, 'i');

  function validateForm(e) {
    let formValid = true;
    inputs.forEach(i => {
      const currentValue = i.value;
      const isMatch = urlRegex.test(currentValue);
      let inputValid = true;

      if ((i.required && !currentValue) || (!!currentValue && !isMatch)) {
        inputValid = false;
        formValid = false;
      }

      if (!inputValid) {
        i.classList.add('invalid');
      } else {
        i.classList.remove('invalid');
      }
    });

    startBtn.disabled = !formValid;

    return formValid;
  }

  function onFormSubmit() {
    if (!validateForm()) {
      alert('The form is invalid.');
      return;
    }
    const urls = [];

    inputs.forEach(i => urls.push(i.value || ''));

    const values = urls.map(val => val.substr(val.lastIndexOf('/') + 1)).filter(val => !!val);

    window.location.href = `watch?v=${values.join(',')}`;
  }

  docReady(() => {
    inputs = document.querySelectorAll('.twitch-link-input');
    startBtn = document.getElementById('start-btn');

    document.querySelector('.options').addEventListener('change', () => validateForm());

    startBtn.addEventListener('click', () => onFormSubmit());

    validateForm();
  });
})();
