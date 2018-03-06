$(document).ready(() => {

  // Initialize Pjax with options or just use Pjax.init().
  //   wrapper   ->  default: .pjax-wrapper
  //   container ->  default: .pjax-container
  //   prefect   ->  default: false
  //   verbose   ->  default: false
  Pjax.init({
    wrapper: '.example-wrapper',    // Inside of wrapper will change.
    container:'.example-container', // Container that will be replaced.
    prefetch: true,                 // Cache all pages on first request.
    enableCache: true,              // Cache pages after loading.
    verbose: true                   // Get lib output (fetching pages,...).
  });


  // !OPTIONAL -> Animate the transitions from the old content to
  // the new content.
  //    oldContainer  ->   html container with old content
  //    newContainer  ->   html container with new content
  Pjax.animate({
    // Start is the constructor for animations
    start: function({oldContainer, newContainer}) {
      // ANIMATIONS GO HERE...
    }

  });

});
