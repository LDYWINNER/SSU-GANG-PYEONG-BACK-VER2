import axios from 'axios';

const setupUser = async (context, events, done) => {
  try {
    console.log('Setting up user...');
    // 유저 생성 API 호출
    await axios.post('http://localhost:3000/auth', {
      username: 'testUser',
      email: 'gildong@stonybrook.edu',
      password: 'Hong123456!',
      passwordConfirm: 'Hong123456!',
    });

    // 로그인하여 토큰 획득
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'gildong@stonybrook.edu',
      password: 'Hong123456!',
    });

    console.log('Generated Token:', loginResponse.data.accessToken);

    // 토큰을 컨텍스트에 저장
    context.vars.token = loginResponse.data.accessToken;

    return done();
  } catch (error) {
    console.error('Error setting up user:', error);
    return done(error);
  }
};

export default setupUser;
