var casper = require('casper').create({
                                          pageSettings: {
                                              loadImages: false,
                                              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
                                          },
                                          verbose: true,
                                          logLevel: 'debug'
                                      }
);


var credentials = require('./credentials.json');

// Debugging/info
casper.on('remote.message', function (message) {
    this.log('Remote Message Caught: ' + message);
});

// Debugging/info
casper.on("page.error", function (message, trace) {
    this.log("Page Error: " + message, "ERROR");
});

// Debugging/info
casper.on('http.status.404', function (resource) {
    this.log('Hey, this one is 404: ' + resource.url, 'warning');
});

// Navigate to MealPal login page
casper.start('https://secure.mealpal.com/login', function pageOpen() {
    this.waitForSelector('form[name="form"]');
    this.log('1. Opened ' + this.getTitle(), 'info');
});

casper.wait(4000);

casper.then(function login() {
    this.log('2. Filling login details', 'info');

    // Fills login details
    // Context is sandboxed within function so global vars are not accessible
    this.evaluate(function fillCredentials(email, password) {
        document.getElementsByName('email')[ 0 ].value = email;
        document.getElementsByName('password')[ 0 ].value = password;
    }, credentials.email, credentials.password);

    this.wait(2000);

    // Fire input change events to over-ride checks for dirty/invalid input fields (makes field ng-dirty and ng-valid)
    this.evaluate(function triggerEvent() {
        angular.element(document.getElementsByName('email')[ 0 ]).change();
        angular.element(document.getElementsByName('password')[ 0 ]).change();
    });

    this.wait(2000);

    // Clicks login button
    this.evaluate(function clickLogin() {
        document.getElementsByClassName('mp-red-button-full')[ 0 ].click();
    });

    this.log('3. Logging In', 'info');
});

casper.wait(6000);


casper.then(function postLogin() {
    this.log('4. Opened: ' + this.getTitle(), 'info');

    // Finds and selects pickup time for first meal on the page
    this.evaluate(function choosePickupTime(casper) {
        casper.log('5. Choosing:' + document.getElementsByClassName('meal')[ 0 ].children[ 0 ].textContent, 'info');
        document.getElementsByClassName('meal')[ 0 ].children[ 2 ].children[ 4 ].children[ 1 ].children[ 6 ].click();
    }, this);

    this.wait(2000);

    // Finds and orders first meal on the page
    this.evaluate(function chooseMeal () {
        document.getElementsByClassName('meal')[ 0 ].children[ 2 ].children[ 5 ].children[ 0 ].click();
    });

});

casper.run();


