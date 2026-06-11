const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { db } = require('./firebase');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const userDoc = await db.collection('users').doc(id).get();
        if (userDoc.exists) {
            done(null, { id: userDoc.id, ...userDoc.data() });
        } else {
            done(null, false);
        }
    } catch (error) {
        done(error, null);
    }
});

// Helper to find or create user
const findOrCreateUser = async (profile, provider) => {
    const usersRef = db.collection('users');
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const providerIdField = `${provider}Id`;

    // 1. Try finding by Provider ID
    let snapshot = await usersRef.where(providerIdField, '==', profile.id).get();
    
    if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }

    // 2. Try finding by Email to Link Account
    if (email) {
        snapshot = await usersRef.where('email', '==', email).get();
        if (!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            await userDoc.ref.update({ [providerIdField]: profile.id });
            return { id: userDoc.id, ...userDoc.data(), [providerIdField]: profile.id };
        }
    }

    // 3. Create new user
    const newUser = {
        email: email,
        fullName: profile.displayName || '',
        [providerIdField]: profile.id,
        avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        hasAccess: true, // Auto-approve social login
        isAdmin: false,
        plan: 'start',
        createdAt: new Date(),
        provider: provider
    };

    const docRef = await usersRef.add(newUser);
    return { id: docRef.id, ...newUser };
};

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.ENABLE_GOOGLE_AUTH === 'true') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUser(profile, 'google');
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.ENABLE_FACEBOOK_AUTH === 'true') {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || "/api/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email'],
        graphApiVersion: 'v17.0' // Atualizado para uma versão moderna
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await findOrCreateUser(profile, 'facebook');
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }));
}

// Instagram Strategy (Note: Uses Facebook Login with Instagram permissions OR dedicated strategy)
// Given the complexity of Instagram Basic Display API, many use Facebook Login for Instagram users.
// We'll add a placeholder for a dedicated Instagram strategy if needed, but Facebook is more reliable for email.

module.exports = passport;
