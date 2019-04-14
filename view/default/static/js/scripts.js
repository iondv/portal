/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/20/17.
 */
$(function(){
  var offsetTop = $('#inner').offset().top;
  var fixed = false;
  $(window).scroll(function(e){
    var scrollTop = $(this).scrollTop();
    if (!fixed && scrollTop >= offsetTop) {
      fixed = true;
      $('.contents').addClass('fixed');
    } else if (fixed && scrollTop < offsetTop) {
      fixed = false;
      $('.contents').removeClass('fixed');
    }
  });
});
