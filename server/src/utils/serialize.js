export const serializeUser = (user) => ({
    id: user._id,

    name: user.name,

    email: user.email,

    role: user.role,

    isEmailVerified: user.isEmailVerified,

    wallet: {
        address: user.wallet.address,
        chainId: user.wallet.chainId,
        verified: user.wallet.verified,
        linkedAt: user.wallet.linkedAt,
    },

    createdAt: user.createdAt,
});