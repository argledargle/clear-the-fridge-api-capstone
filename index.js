"use strict";

//set API auth info
const edamamSearchUrl = "https://api.edamam.com/search";
const appId = "c8b6b757";
const appKey = "112f88722937558772de9b30b52b63ed";

//format search parameters into an API friendly format
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );

  return queryItems.join("&");
}

//ccalls upon the API to return a json file. Error reporting for results exceeded as well.
function getRecipes(searchTerm, limit = 10, diet) {
  const params = {
    q: searchTerm,
    app_id: appId,
    app_key: appKey,
    to: limit
  };
  if (diet != "") {
    params.diet = diet;
  }
  const queryString = formatQueryParams(params);
  const url = edamamSearchUrl + "?" + queryString;
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $("#js-error-message").text(
        `Search limit exceeded: 5 searches per minute. ${err.message}.`
      );
    });
}
//Builds out all of the HTML content from the results.
function displayResults(responseJson) {
  $("#results-list").empty();
  $("#js-error-message").empty();
  $(".site-preview").addClass("hidden");

  if (responseJson.hits.length === 0) {
    $("#js-error-message").text(
      `No one wants to eat that... Try something else!`
    );
  } else {
    for (let i = 0; i < responseJson.hits.length; i++) {
      let ingredients = "";
      let healthInfo = "";
      let dietInfo = "";
      for (
        let j = 0;
        j < responseJson.hits[i].recipe.ingredientLines.length;
        j++
      ) {
        ingredients =
          ingredients +
          `<li role="listitem" class="ingredientitem">
					<div class="items">
						<p class="item">${responseJson.hits[i].recipe.ingredientLines[j]}</p>
					</div>
				</li>`;
      }

      for (
        let j = 0;
        j < responseJson.hits[i].recipe.healthLabels.length;
        j++
      ) {
        healthInfo =
          healthInfo +
          `<li role="listitem">
					<div class="items">
						<p class="item">${responseJson.hits[i].recipe.healthLabels[j]}</p>
					</div>
				</li>`;
      }

      for (let j = 0; j < responseJson.hits[i].recipe.dietLabels.length; j++) {
        dietInfo =
          dietInfo +
          `<li role="listitem">
					<div class="items">
						<p class="item">${responseJson.hits[i].recipe.dietLabels[j]}</p>
					</div>
				</li>`;
      }
      $("#results-list").append(
        `<li role="listitem" id="listitem">
					<div id="search-result" class="search-result">
						<a href="${
              responseJson.hits[i].recipe.url
            }" role="link" target="_blank"><img src="${
          responseJson.hits[i].recipe.image
        }" class="recipe-img" alt="Image of recipe"></a>
						<a href="${
              responseJson.hits[i].recipe.url
            }" role="link" class="recipe-label-a" target="_blank"><p class="recipe-label">${
          responseJson.hits[i].recipe.label
        }</p></a>
                       
						<p class="recipe-source">${responseJson.hits[i].recipe.source}</p>

						<div class="expand-buttons">
							<button type="button" id="show-ingredients" class="show-ingredients" data-ingredients=${i}" role="button">Ingredients</button>
							<button type="button" id="show-health-info" class="show-health-info" data-health-info=${i}" role="button">Diet Info</button>
						</div>
					</div>
					<div class="ingredients-container">
						<section id="ingredients-${i}" class="ingredients hidden" role="region">
							<ul id="ingredients-list" class="ingredients-list" role="list">
								${ingredients}
							</ul>
						</section>
					</div>
					<div class="health-info-container">
						<section id="health-info-${i}" class="health-info hidden" role="region">
							<ul id="health-info-list" class="health-info-list" role="list">
								${healthInfo}
							</ul>
							<ul id="diet-info-list" class="diet-info-list" role="list">
								${dietInfo}
							</ul>
						</section>
                    
                    <div id="grocery">
                   <button onclick="on()">Where's my nearest grocery store?</button>
                  </div>
                  </div>
				</li>`
      );
    }
  }

  $("#results").removeClass("hidden");
}

//watches search form and ensures text is entered

function watchSearchForm() {
  $("form").submit(event => {
    event.preventDefault();
    const searchTerm = $("#search-term").val();
    const limit = $("#js-max-results").val();

    let diet = $(".diet").val();
    if (searchTerm == "") {
      alert("please fill out text");
    }

    getRecipes(searchTerm, limit, diet);
  });
}

//watches show ingredients button and makes sure content is shown

function watchShowIngredientsButton() {
  $("#results-list").on("click", "#show-ingredients", event => {
    let recipeNum = $(event.currentTarget).data("ingredients");

    if (
      !$(this)
        .find("#health-info-" + recipeNum.replace('"', ""))
        .hasClass("hidden")
    ) {
      $(this)
        .find("#health-info-" + recipeNum.replace('"', ""))
        .addClass("hidden");
    }

    if (
      !$(this)
        .find("#ingredients-" + recipeNum.replace('"', ""))
        .hasClass("hidden")
    ) {
      $(this)
        .find("#ingredients-" + recipeNum.replace('"', ""))
        .addClass("hidden");
    } else {
      $(this)
        .find("#ingredients-" + recipeNum.replace('"', ""))
        .removeClass("hidden");
    }
  });
}

//watches show diet button and shows content related to that

function watchShowHealthInfoButton() {
  $("#results-list").on("click", "#show-health-info", event => {
    let recipeNum = $(event.currentTarget).data("health-info");

    if (
      !$(this)
        .find("#ingredients-" + recipeNum.replace('"', ""))
        .hasClass("hidden")
    ) {
      $(this)
        .find("#ingredients-" + recipeNum.replace('"', ""))
        .addClass("hidden");
    }

    if (
      !$(this)
        .find("#health-info-" + recipeNum.replace('"', ""))
        .hasClass("hidden")
    ) {
      $(this)
        .find("#health-info-" + recipeNum.replace('"', ""))
        .addClass("hidden");
    } else {
      $(this)
        .find("#health-info-" + recipeNum.replace('"', ""))
        .removeClass("hidden");
    }
  });
}
// on function displays map iframe
function on() {
  document.getElementById("overlay").style.display = "flex";
}
// off function turns off map iframe
function off() {
  document.getElementById("overlay").style.display = "none";
}

$(watchShowIngredientsButton);
$(watchShowHealthInfoButton);
$(watchSearchForm);
