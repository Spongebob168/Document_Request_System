const generateReference = () => {
    return 'REQ-' + Date.now();
};

module.exports = generateReference;