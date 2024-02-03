Todo:

Fix the following:

2fa

Theirs
otp_enabled Boolean @default(false)
otp_verified Boolean @default(false)

    otp_ascii String?
    otp_hex String?
    otp_base32 String?
    otp_auth_url String?

Mine:

    two_factor_auth_enabled: boolean;
    two_factor_auth_secret: string;

user dto
User {
id: 1,
id_42: '133453',
oauthToken: '3741fc0940668aac35f4dc862139d193e021b9b4dcf448e2dc1251ac0ccdbd6f',
refreshToken: '56ed0afd55ee3e1cd876de2dd3d3232adc9b804fc38be84e664db551d1704eb4',
authorizationCode: null,
stateParameter: null,
nickname: 'chinedu',
password: null,
avatar: 'https://media.istockphoto.com/vectors/anonymity-concept-icon-in-neon-line-style-vector-id1259924572?k=20&m=1259924572&s=612x612&w=0&h=Xeii8p8hOLrH84PO4LJgse5VT7YSdkQY_LeZOjy-QD4=',
two_factor_auth_enabled: false,
two_factor_auth_secret: null,
status: 'online',
blockedUsers: []
}

when you call the create direct message to send a message to a user which
Remember to Unmute

21. auth.service.ts - validate
22. user.controller.ts - createUser
23. user.service.ts - createUser , findOrCreateUser
