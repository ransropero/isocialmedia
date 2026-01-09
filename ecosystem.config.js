module.exports = {
    apps: [{
        name: "instagram-scheduler",
        script: "./server/index.js",
        watch: false,
        env: {
            NODE_ENV: "production",
        }
    }]
}
