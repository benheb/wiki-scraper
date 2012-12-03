$('#update-wiki').live('click', function() {
  $('#loading-div').show();
  var val = $('#wiki-url').val();
  $.ajax({
    type: 'POST',
    url: "/db",
    data: {url: val},
    success: function() {
      $('#wiki-url').val("");
      var url_item = '<div class="url-wrapper"><div class="status">status</div><div class="urls"><a href="'+val+'" target="blank">'+val+'</a></div><div id="'+val+'" class="btn remove-url">remove</div></div>';
      $(url_item).appendTo($('#url-container'));
      $('#loading-div').hide();
    }
  }); 
});

$('.remove-url').live('click', function() {
  var val = $(this).attr('id');
  var el = $(this);
  $.ajax({
    type: 'POST',
    url: "/db/remove",
    data: {url: val},
    success: function() {
      $(el).parent().hide();
    }
  }); 
});

$('#check').live('click', function() {
  var urls = [];
  $(this).addClass('loading');
  $('.urls').each(function() {
    var url = $(this).next().attr('id');
    urls.push(url);
  });
  console.log('urls', urls)
  $.ajax({
    type: "POST",
    url: "/checkdbs",
    data: {urls: urls},
    success: function(res) {
      console.log('fuck yes bitches!', res);
      updateUrlStatus(res);
      $('#check').removeClass('loading');
    }
  })
});

$.ajax({
  url:'/wiki-urls', 
  success: function(data){
    $.each(data, function(i,f){
      var url_item = '<div class="url-wrapper"><div class="status">status</div><div class="urls"><a href="'+f.url+'" target="blank">'+f.url+'</a></div><div id="'+f.url+'" class="btn remove-url">remove</div></div>';
      $(url_item).appendTo($('#url-container'))
    });
  }
});

function updateUrlStatus(urls) {
  var urlObjs = $.parseJSON(urls);
  $.each(urlObjs, function(i,obj) {
    $('.urls').each(function(){
      var url = $(this).next().attr('id');
      if (obj.url == url) {
        if (obj.status == 'okay') {
          $(this).prev().removeClass('update').addClass('ok').html('Okay');
        } else {
          $(this).prev().removeClass('ok').addClass('update').html('Updated')
        }   
      }
      
    });  
  })
  
}
