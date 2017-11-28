

/**
 * Get /
 * home page
 */
exports.homePage = (req, res) => {
    
    res.render('pages/homepage', {
        title: 'Marvel'
    });
    req.session.destroy();
};

/**
 * Get /films
 * films page
 */
exports.filmsPage = (req, res) => {
    res.render('pages/films', {
        title: 'Films'
    });
};

/**
 * Get /serials
 * serials page
 */
exports.serialsPage = (req, res) => {
    res.render('pages/serials', {
        title: 'Serials'
    });
};

/**
 * Get /comics
 * comics page
 */
exports.comicsPage = (req, res) => {
    res.render('pages/comics', {
        title: 'Comics'
    });
};

/**
 * Get /heroes
 * heroes page
 */
exports.heroesPage = (req, res) => {
    res.render('pages/heroes', {
        title: 'Heroes'
    });
};