const config = {
    type: 'app',

    entryPoints: {
        app: './src/App.js',
    },
    customAuthorities:[
        'BULLETIN_ADMIN',
        'BULLETIN_VIEWER'
    ],
    dataStoreNamespace: 'webapp_bulletin_store',
}

module.exports = config
