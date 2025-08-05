const passwordInput = document.getElementById('passwordInput');
const strengthResult = document.getElementById('strengthResult');
const breachResult = document.getElementById('breachResult');

passwordInput.addEventListener('input', async function () {
  const password = passwordInput.value;
  if (!password) {
    strengthResult.textContent = '';
    breachResult.textContent = '';
    return;
  }

  checkStrength(password);
  checkBreach(password);
});

function checkStrength(password) {
  let strength = 'Weak';
  const regexStrong = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$");
  const regexMedium = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[A-Z])(?=.*\\d))|((?=.*[a-z])(?=.*\\d))).{6,}$");

  if (regexStrong.test(password)) {
    strength = 'Very Strong 💪';
    strengthResult.style.color = 'green';
  } else if (regexMedium.test(password)) {
    strength = 'Medium ⚠️';
    strengthResult.style.color = 'orange';
  } else {
    strength = 'Weak ❌';
    strengthResult.style.color = 'red';
  }

  strengthResult.textContent = `Strength: ${strength}`;
}

// Function to check if password is pwned using HaveIBeenPwned API (k-Anonymity model)
async function checkBreach(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

  const prefix = hashHex.substring(0, 5);
  const suffix = hashHex.substring(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await response.text();
  const lines = text.split('\n');
  const found = lines.find(line => line.startsWith(suffix));

  if (found) {
    const count = found.split(':')[1].trim();
    breachResult.textContent = `⚠️ Oh no! This password was found in ${count} data breaches.`;
    breachResult.style.color = 'red';
  } else {
    breachResult.textContent = '✅ This password has not been found in any data breaches.';
    breachResult.style.color = 'green';
  }
}
