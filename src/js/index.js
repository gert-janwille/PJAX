$(document).ready(() => {

  console.log(Pjax);

  Pjax.init({
    wrapper: '.barba-wrapper',
    container:'.barba-container',
    prefetch: true,
    verbose: true
  });

  Pjax.animate({

    start: function({oldContainer, newContainer}) {

      // All in One
      // oldContainer.animate({ opacity: 0 }, 1000).promise().done(() => {
      //   newContainer.animate({ opacity: 1 }, 1000);
      // });


      //One by One
      newContainer.css({
        'marginLeft': '100vw',
        'opacity': '0'
      });

      oldContainer.find('.title').animate({ opacity: 0 }, 300);
      oldContainer.find('.text').animate({ opacity: 0 }, 800);
      oldContainer.animate({ opacity: 0 }, 1300).promise().done(() => {
        // TODO: animate new content items one-by-one
        newContainer.animate({ marginLeft: '0', opacity: 1 }, 1300)
      });


      // TODO: CSS Keyframes, classes

    }

  });


  // var transEffect = Barba.BaseTransition.extend({
  //   start: function(){
  //     isAnimating = true;
  //
  //     this.newContainerLoading.then(val => this.fadeInNewcontent($(this.newContainer)));
  //   },
  //
  //   fadeInNewcontent: function(nc) {
  //     var _this = this;
  //
  //     nc.animate({ opacity: 1 }, 800)
  //     $(this.oldContainer).fadeOut(1000).promise().done(() => {
  //       _this.done();
  //     });
  //   }
  // });
  //
  // Barba.Pjax.getTransition = function() {
  //   return transEffect;
  // }
  //
  // Barba.Pjax.start();

  // $(".load-btn").click(clickedContent);

});
