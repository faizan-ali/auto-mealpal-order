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

    this.evaluate(function chooseLocation() {
        // Sets location
        document.getElementsByClassName('filter-text')[0].children[0].value = '1900 M Street NW';
        // Simulates Enter keypress
        document.getElementsByClassName('filter-text')[0].children[0].dispatchEvent(new KeyboardEvent('keydown', {'keyCode':13, 'which':13}));
        document.getElementsByClassName('search-button')[0].click();
    });

    // Finds and selects pickup time for the first meal containing keyword 'Chicken' on the page
    this.evaluate(function choosePickupTime () {
        // TODO: Switch to class names versus traversing down descendants; class names likely to remain more constant than DOM
        for (var i = 0; i < document.getElementsByClassName('meal').length; i++) {
            if (document.getElementsByClassName('meal')[ i ].children[ 0 ].textContent.indexOf('Chicken') != -1) {
                console.log('5. Choosing meal: ' + document.getElementsByClassName('meal')[ i ].children[ 0 ].textContent, 'info');
                // Chooses one of the last few pickup times
                console.log('6. Choosing time: ' +  document.getElementsByClassName('meal')[ i ].children[ 2 ].children[ 4 ].children[ 1 ].children[ 5 ].textContent, 'info');
                document.getElementsByClassName('meal')[ i ].children[ 2 ].children[ 4 ].children[ 1 ].children[ 5 ].click();
                break;
            }
        }
    });

    this.wait(2000);

    // Finds and orders the first meal containing keyword 'Chicken' on the page
    this.evaluate(function chooseMeal () {
        // TODO: Switch to class names versus traversing down descendants; class names likely to remain more constant than DOM
        for (var i = 0; i < document.getElementsByClassName('meal').length; i++) {
            if (document.getElementsByClassName('meal')[ i ].children[ 0 ].textContent.indexOf('Chicken') != -1) {
                // Clicks on Reserve button
                document.getElementsByClassName('meal')[ i ].children[ 2 ].children[ 5 ].children[ 0 ].click();

                console.log('7. Meal ordered', 'info');
                break;
            }
        }
    });

});

casper.run();


