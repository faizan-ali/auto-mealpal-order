var credentials = require('./credentials.json');

var casper = require('casper').create({
                                          pageSettings: {
                                              loadImages: false
                                          }
                                      });

// Navigate to MealPal login page
casper.start().thenOpen('https://secure.mealpal.com/login', function () {
    console.log('Opened ' + this.getTitle());
});

casper.then(function () {
    console.log('Filling login credentials');
    JSON.parse('credentials.json');
    this.evaluate(function () {
        // Fill e-mail
        document.getElementsByName('email')[ 0 ].value = credentials.email;
        // Fill password
        document.getElementsByName('password')[ 0 ].value = credentials.password;

        // Fire input change events to over-ride checks for dirty/invalid input fields (makes field ng-dirty and ng-valid)
        angular.element(document.getElementsByName('email')[ 0 ]).change();
        angular.element(document.getElementsByName('password')[ 0 ]).change();

        // Click Login button
        document.getElementsByClassName('mp-red-button-full')[ 0 ].click();
    });

    console.log('Logging In');

    // Artificial delay for page rendering
    this.wait(6000);
});

casper.then(function () {
    let title = this.evaluate(function () {
        return document.title;
    });

    console.log('Logged In');
    console.log('Opened: ' + title);


    // Finds and selects the first meal name with the occurrence of "Chicken"
    // TODO: Switch to class names versus traversing down descendants; class names likely to remain more constant than DOM
    for (let i = 0; i < document.getElementsByClassName('meal').length; i++) {
        if (document.getElementsByClassName('meal')[ i ].children[ 0 ].textContent.indexOf('Chicken') != -1) {
            // Chooses one of the last few pickup times
            document.getElementsByClassName('meal')[ i ].children[ 2 ].children[ 4 ].children[ 1 ].children[ 9 ].click();
            // Clicks on Reserve button
            document.getElementsByClassName('meal')[i].children[2].children[5].children[0].click();
            break;
        }
    }
});

casper.run();


