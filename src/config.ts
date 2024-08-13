// import { FirebaseOptions } from 'firebase/app';

enum BSENV {
    prod = 'prod',
    qa = 'qa',
}

interface Config {
    SAMPLE_APP_SERVICE_URL: string
    SAMPLE_APP_SERVICE_SOCKET_URL: string
}

// Current ENV
// const env: BSENV = BSENV.qa;
const env: BSENV = BSENV.prod;

// TODO: fill service end url
const config_qa: Config = {
    SAMPLE_APP_SERVICE_URL: 'https://',
    SAMPLE_APP_SERVICE_SOCKET_URL: 'wss://'
};

// TODO: fill service end url
const config_prod: Config = {
    SAMPLE_APP_SERVICE_URL: 'https://',
    SAMPLE_APP_SERVICE_SOCKET_URL: 'wss://'
};

let selected_config: Config;
switch (env as BSENV) {
    case BSENV.qa:
        selected_config = config_qa;
        break; 
    case BSENV.prod:
        selected_config = config_prod;
        break; 
}

let config = selected_config;
export default config;
