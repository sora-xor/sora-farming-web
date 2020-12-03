$(document).ready(function () {
  $('#hiddenTop').delay(200).queue(function () {
    $('#hiddenTop').addClass('showTop').dequeue()
    $('#hiddenBottom').addClass('showBottom').dequeue()
  })
  $('#linkArticle').delay(2000).queue(function () {
    $(this).addClass('showArticle').dequeue()
  })
  $('#closeArticle').click(function () {
    $('#linkArticle').addClass('hideArticle')
  })
})