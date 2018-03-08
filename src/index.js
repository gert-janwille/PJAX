$(document).ready(() => {

  // Initialize the Pjax Library.
  Pjax.init({
    wrapper: '.pjax-wrapper',    // Inside of wrapper will change.
    container:'.pjax-container', // Container that will be replaced.
    prefetch: true,               // Cache all pages on first request.
    enableCache: true,            // Cache pages after loading.
    verbose: true,                // Get lib output (fetching pages,...).
  });

  // !OPTIONAL -> Animate the transitions from the old content to
  // the new content.
  //    oldContainer  ->   html container with old content
  //    newContainer  ->   html container with new content
  Pjax.animate({
    // The start is the constructor for animating the containers.
    start: function({oldContainer, newContainer}) {
      // ANIMATIONS GO HERE...

      // One by One
      newContainer.css({
        'marginLeft': '100vw',
        'opacity': '0'
      });

      oldContainer.find('.title').animate({ opacity: 0 }, 100);
      oldContainer.find('.text').animate({ opacity: 0 }, 500);
      oldContainer.animate({ opacity: 0 }, 1300).promise().done(() => {
        newContainer.animate({ marginLeft: '0', opacity: 1 }, 800)
      });

    }
  });

});
