document.addEventListener('DOMContentLoaded', () => {

  // Checkboxes behavior
  const weddingDateUndecided = document.getElementById('weddingDateUndecided');
  const weddingDateInput = document.getElementById('weddingDate');
  if (weddingDateUndecided && weddingDateInput) {
    weddingDateUndecided.addEventListener('change', (e) => {
      weddingDateInput.disabled = e.target.checked;
      if (e.target.checked) weddingDateInput.value = '';
    });
  }

  const noCar = document.getElementById('noCar');
  const carNumberInput = document.getElementById('carNumber');
  if (noCar && carNumberInput) {
    noCar.addEventListener('change', (e) => {
      carNumberInput.disabled = e.target.checked;
      if (e.target.checked) carNumberInput.value = '';
    });
  }

  const revealElements = document.querySelectorAll('.reveal');

  const revealOnScroll = () => {
    const triggerBottom = (window.innerHeight / 10) * 8.5;

    revealElements.forEach(el => {
      const elTop = el.getBoundingClientRect().top;
      if (elTop < triggerBottom) {
        el.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Run once initially

  // RSVP Form submission handling
  const rsvpForm = document.getElementById('rsvpForm');
  const successMsg = document.getElementById('successMsg');
  const scriptURL = 'https://script.google.com/macros/s/AKfycbzAg2mYzXMOE2r-3EJC4Dj7eLcwfIYfLMEjwq9nXgoSgXRD_q8bhA2ISEJwMCNZsTibkw/exec';

  if (rsvpForm) {
    // Checkbox toggle logic for form inputs
    const setupToggle = (checkboxId, inputId) => {
      const checkbox = document.getElementById(checkboxId);
      const input = document.getElementById(inputId);
      if (checkbox && input) {
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            input.value = '';
            input.disabled = true;
          } else {
            input.disabled = false;
          }
        });
      }
    };
    setupToggle('weddingDateUndecided', 'weddingDate');
    setupToggle('guestsUndecided', 'guests');
    setupToggle('noCar', 'carNumber');

    // 희망 방문일에 따른 방문 시간 옵션 동적 설정 (10일 토요일 11시 마감 처리)
    const timeOptionsByDate = {
      '10월10일(토)': [
        { time: '11시', disabled: true, label: '11시 (마감)' },
        { time: '12시', disabled: false, label: '12시' },
        { time: '1시', disabled: false, label: '1시' },
        { time: '2시', disabled: false, label: '2시' },
        { time: '3시', disabled: false, label: '3시' },
        { time: '4시', disabled: false, label: '4시' },
        { time: '5시', disabled: false, label: '5시' }
      ],
      '10월11일(일)': [
        { time: '11시', disabled: false, label: '11시' },
        { time: '12시', disabled: false, label: '12시' },
        { time: '1시', disabled: false, label: '1시' },
        { time: '2시', disabled: false, label: '2시' },
        { time: '3시', disabled: false, label: '3시' },
        { time: '4시', disabled: false, label: '4시' },
        { time: '5시', disabled: false, label: '5시' }
      ]
    };

    const visitDateSelect = document.getElementById('visitDate');
    const visitTimeSelect = document.getElementById('visitTime');

    if (visitDateSelect && visitTimeSelect) {
      visitDateSelect.addEventListener('change', () => {
        const selectedDate = visitDateSelect.value;
        const timeList = timeOptionsByDate[selectedDate];

        visitTimeSelect.innerHTML = '<option value="" disabled selected>방문 시간을 선택하세요</option>';

        if (timeList && timeList.length > 0) {
          visitTimeSelect.disabled = false;
          timeList.forEach(item => {
            const option = document.createElement('option');
            option.value = item.time;
            option.textContent = item.label;
            if (item.disabled) {
              option.disabled = true;
            }
            visitTimeSelect.appendChild(option);
          });
        } else {
          visitTimeSelect.disabled = true;
        }
      });
    }

    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic Validation
      const role = document.getElementById('role').value;
      const name = document.getElementById('name').value.trim();
      // 전화번호 정규화: 숫자만 추출 후 xxx-xxxx-xxxx 형식으로 변환
      const phoneRaw = document.getElementById('phone').value.trim();
      const phoneDigits = phoneRaw.replace(/\D/g, '');
      let phone = phoneRaw;
      if (/^\d{10}$/.test(phoneDigits)) {
        phone = phoneDigits.slice(0, 3) + '-' + phoneDigits.slice(3, 6) + '-' + phoneDigits.slice(6);
      } else if (/^\d{11}$/.test(phoneDigits)) {
        phone = phoneDigits.slice(0, 3) + '-' + phoneDigits.slice(3, 7) + '-' + phoneDigits.slice(7);
      }

      const weddingDateInput = document.getElementById('weddingDate').value;
      const weddingDateUndecided = document.getElementById('weddingDateUndecided').checked;
      const weddingDate = weddingDateUndecided ? '미정' : weddingDateInput;

      const guestsInput = document.getElementById('guests').value.trim();
      const guestsUndecided = document.getElementById('guestsUndecided').checked;
      const guests = guestsUndecided ? '미정' : guestsInput;

      const carNumberInput = document.getElementById('carNumber').value.trim();
      const noCar = document.getElementById('noCar').checked;
      const carNumber = noCar ? '해당없음' : carNumberInput;

      const visitDate = document.getElementById('visitDate').value;
      const visitTime = document.getElementById('visitTime').value;
      const privacy = document.getElementById('privacy').checked;

      if (!name || !phone || (!weddingDateInput && !weddingDateUndecided) || (!guestsInput && !guestsUndecided) || !visitDate || !visitTime) {
        alert('필수 입력란을 모두 채워주세요.');
        return;
      }

      if (!privacy) {
        alert('개인정보 수집 및 이용에 동의해 주세요.');
        return;
      }

      // Start submission process
      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'SENDING...';

      // Convert data to URLSearchParams for Google Apps Script parameter receiver
      const formData = new URLSearchParams();
      formData.append('role', role);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('weddingDate', weddingDate);
      formData.append('guests', guests);
      formData.append('carNumber', carNumber);
      formData.append('visitDate', visitDate);
      formData.append('visitTime', visitTime);

      fetch(scriptURL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.result === 'success') {
            // Fade out form, fade in success message
            rsvpForm.style.transition = 'opacity 0.5s ease';
            rsvpForm.style.opacity = '0';

            setTimeout(() => {
              rsvpForm.style.display = 'none';
              successMsg.style.display = 'block';
              successMsg.style.opacity = '0';

              // Trigger reflow
              successMsg.offsetHeight;

              successMsg.style.transition = 'opacity 0.5s ease';
              successMsg.style.opacity = '1';

              // RSVP 섹션 상단 첫부분이 기준이 되도록 스크롤
              const rsvpSection = document.getElementById('rsvp');
              if (rsvpSection) {
                rsvpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 500);
          } else {
            alert('신청 중 오류가 발생했습니다: ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        })
        .catch(error => {
          console.error('Error!', error);
          alert('서버 전송에 실패했습니다. 다시 시도해 주세요.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        });
    });
  }
});
