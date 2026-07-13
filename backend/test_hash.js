const bcrypt = require('bcryptjs');

const hash = '$2a$10$u61PmqIpLYEY.aYKYcR9CeFviIrFVj7az.rRQr4tCXYrR4dgN/Uii';
const password = '14912malik';

bcrypt.compare(password, hash).then(result => {
  console.log('Password match:', result);
  
  if (!result) {
    // Generate a fresh correct hash
    bcrypt.hash(password, 10).then(newHash => {
      console.log('NEW CORRECT HASH:', newHash);
    });
  }
});
