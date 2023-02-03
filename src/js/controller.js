import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';

import paginationView from './views/paginationView.js';

import { async } from 'regenerator-runtime';

// https://forkify-api.herokuapp.com/v2

// if (module.hot) {
//   module.hot.accept();
// }

///////////////////////////////////////
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    console.log(id);

    //Update result
    resultsView.update(model.getSearchResultPage());
    bookmarkView.update(model.state.bookmarks);

    recipeView.renderSpinner();
    // 1.Loading
    await model.loadRecipe(id);

    //2. Rendering
    recipeView.render(model.state.recipe);
    console.log(model.state.recipe);
  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //Get search query
    const query = searchView.getQueey();
    if (!query) return;

    // Load search result
    await model.loadSearchResults(query);

    // Render result
    resultsView.render(model.getSearchResultPage());

    // Render initial pagination
    paginationView.render(model.state.search);
  } catch (error) {
    throw error;
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultPage(goToPage));

  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update servings in state

  model.updateServings(newServings);
  //Update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  //Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //Render bookmark
  bookmarkView.render(model.state.bookmarks);

  // Bookmark update
  recipeView.update(model.state.recipe);
};

const controlBokmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  //Upload data
  try {
    // Show loading
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //render
    recipeView.render(model.state.recipe);

    //success
    addRecipeView.renderMessage();

    //close form
    // setTimeout(function () {
    //   addRecipeView.toggleWindow();
    // }, MODAL_CLOSE_SEC * 1000);

    //Render bookmarkview
    bookmarkView.render(model.state.bookmarks);

    //Change url id
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
  } catch (e) {
    addRecipeView.renderError(e.message);
  }
};
const init = function () {
  bookmarkView.addHandlerRender(controlBokmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookMark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerRender(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
