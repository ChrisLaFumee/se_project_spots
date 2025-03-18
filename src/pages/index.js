import "../pages/index.css";
import { setButtonText } from "../utils/helpers.js";
import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "a41b184f-a3bd-4344-8359-a2d01db23146",
    "Content-Type": "application/json",
  },
});

let userId;

api
  .getAppInfo()
  .then(([cards, user]) => {
    userId = user._id;
    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.prepend(cardElement);
    });
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
    profileAvatar.src = user.avatar;
  })
  .catch(console.error);

/* -------------------------------------------------------------------------- */
/*                            Modals for listeners                            */
/* -------------------------------------------------------------------------- */
const modals = document.querySelectorAll(".modal");

/* -------------------------------------------------------------------------- */
/*                              Profile elements                              */
/* -------------------------------------------------------------------------- */
const editModalButton = document.querySelector(".profile__edit-button");
const cardModalButton = document.querySelector(".profile__add-button");
const avatarModalButton = document.querySelector(".profile__avatar-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

/* -------------------------------------------------------------------------- */
/*                          Avatar form elements                          */
/* -------------------------------------------------------------------------- */
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitButton = avatarForm.querySelector(".modal__submit-button");
const avatarLinkInput = avatarModal.querySelector("#profile-avatar-input");

/* -------------------------------------------------------------------------- */
/*                      Edit form elements                                    */
/* -------------------------------------------------------------------------- */
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const nameInput = editModal.querySelector("#profile-name-input");
const descriptionInput = editModal.querySelector("#profile-description-input");
const profileSubmitButton = editFormElement.querySelector(
  ".modal__submit-button"
);

/* -------------------------------------------------------------------------- */
/*                                Card elements                               */
/* -------------------------------------------------------------------------- */
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

/* -------------------------------------------------------------------------- */
/*                            Preview Image Popups                            */
/* -------------------------------------------------------------------------- */
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");

/* -------------------------------------------------------------------------- */
/*                              Card related elements                         */
/* -------------------------------------------------------------------------- */
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");
const cardSubmitButton = cardForm.querySelector(".modal__submit-button");

/* -------------------------------------------------------------------------- */
/*                            Delete form elements                            */
/* -------------------------------------------------------------------------- */
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
let cardToDelete = null;

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardTitleElement = cardElement.querySelector(".card__title");
  const cardImageElement = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardElement.dataset.id = data._id;

  cardTitleElement.textContent = data.name;
  cardImageElement.src = data.link;
  cardImageElement.alt = data.name;

  if (data.isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  }

  cardLikeButton.addEventListener("click", () => {
    const isLiked = cardLikeButton.classList.contains(
      "card__like-button_liked"
    );
    api
      .changeLikeCardStatus(data._id, isLiked)
      .then((updatedCard) => {
        console.log(data);
        console.log(isLiked);
        data.likes = updatedCard.likes;
        cardLikeButton.classList.toggle("card__like-button_liked");
      })
      .catch(console.error);
  });

  cardDeleteButton.addEventListener("click", () => {
    cardToDelete = data._id;
    openModal(deleteModal);
  });

  cardImageElement.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.alt = data.name;
  });

  return cardElement;
}

deleteForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  api
    .deleteCard(cardToDelete)
    .then(() => {
      const cardElement = document.querySelector(`[data-id="${cardToDelete}"]`);
      cardElement.remove();
      closeModal(deleteModal);
    })
    .catch(console.error);
});

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscKeyPress);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscKeyPress);

  if (modal === deleteModal) {
    cardToDelete = null;
  }
}

const deleteModalCancelButton = deleteModal.querySelector(
  ".modal_delete-card_cancel"
);
if (deleteModalCancelButton) {
  deleteModalCancelButton.addEventListener("click", () => {
    closeModal(deleteModal);
  });
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  setButtonText(profileSubmitButton, true, "Saving...");

  api
    .editUserInfo({
      name: nameInput.value,
      about: descriptionInput.value,
    })
    .then((user) => {
      profileName.textContent = user.name;
      profileDescription.textContent = user.about;
      editFormElement.reset();
      resetValidation(
        editFormElement,
        [nameInput, descriptionInput],
        validationConfig
      );
      closeModal(editModal);
      disableButton(
        editFormElement.querySelector(".modal__submit-button"),
        validationConfig
      );
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setButtonText(profileSubmitButton, false, "Save");
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  setButtonText(cardSubmitButton, true, "Saving...");

  const cardData = {
    name: cardNameInput.value,
    link: cardLinkInput.value,
  };
  api
    .addNewCard(cardData)
    .then((card) => {
      const cardElement = getCardElement(card);
      cardsList.prepend(cardElement);
      cardForm.reset();
      disableButton(
        cardForm.querySelector(".modal__submit-button"),
        validationConfig
      );
      resetValidation(
        cardForm,
        [cardNameInput, cardLinkInput],
        validationConfig
      );
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(profileSubmitButton, false, "Save");
    });
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  setButtonText(avatarSubmitButton, true, "Saving...");

  api
    .changeAvatar({
      avatar: avatarLinkInput.value,
    })
    .then((user) => {
      profileAvatar.src = user.avatar;
      avatarForm.reset();
      resetValidation(avatarForm, [avatarLinkInput], validationConfig);
      disableButton(
        avatarForm.querySelector(".modal__submit-button"),
        validationConfig
      );
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(profileSubmitButton, false, "Save");
    });
}

editModalButton.addEventListener("click", () => {
  nameInput.value = profileName.textContent;
  descriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [nameInput, descriptionInput],
    validationConfig
  );
  openModal(editModal);
});

modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (
      evt.target.classList.contains("modal") ||
      evt.target.classList.contains("modal__close-button")
    ) {
      closeModal(modal);
    }
  });
});

function handleEscKeyPress(evt) {
  console.log("Key pressed:", evt.key);
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    console.log("Opened modal found:", openedModal);
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

enableValidation(validationConfig);
