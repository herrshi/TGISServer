// SideNav Initialization
$(".button-collapse").sideNav();
// SideNav Scrollbar Initialization
var sideNavScrollbar = document.querySelector(".custom-scrollbar");
Ps.initialize(sideNavScrollbar);

// Material Select Initialization
$(document).ready(function() {
  $(".mdb-select").material_select();
});

function generateUrlWithParams(url, params) {
  let urlParams = [];
  for (let key in params) {
    if (params.hasOwnProperty(key) && params[key]) {
      urlParams.push(`${key}=${params[key]}`);
    }
  }
  url += "?" + urlParams.join("&");
  return url;
}
