import "../pages/index.css";
import {
  enableValidation,
  validationConfig,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "a41b184f-a3bd-4344-8359-a2d01db23146",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.prepend(cardElement);
    });
    profileName.textContent = user.name;
    profileDescription.textContent = user.about;
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
const avatarModalCloseButton = avatarModal.querySelector(
  ".modal__close-button"
);
const avatarLinkInput = avatarModal.querySelector("#profile-avatar-input");

/* -------------------------------------------------------------------------- */
/*                      Edit form elements                                    */
/* -------------------------------------------------------------------------- */
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const nameInput = editModal.querySelector("#profile-name-input");
const descriptionInput = editModal.querySelector("#profile-description-input");

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

/* -------------------------------------------------------------------------- */
/*                            Delete form elemenets                           */
/* -------------------------------------------------------------------------- */
const deleteModal = document.querySelector("#delete-modal");

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardTitleElement = cardElement.querySelector(".card__title");
  const cardImageElement = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardTitleElement.textContent = data.name;
  cardImageElement.src = data.link;
  cardImageElement.alt = data.name;

  cardLikeButton.addEventListener("click", () => {
    cardLikeButton.classList.toggle("card__like-button_liked");
  });

  cardDeleteButton.addEventListener("click", () => {
    openModal(deleteModal);
    api
      .deleteCard(data._id)
      .then(() => {
        cardElement.remove();
      })
      .catch(console.error);
  });

  cardImageElement.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.alt = data.name;
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscKeyPress);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscKeyPress);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
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
        settings
      );
    })
    .catch(console.error);
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
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
      resetValidation(
        cardForm,
        [cardNameInput, cardLinkInput],
        validationConfig
      );
      closeModal(cardModal);
    })
    .catch(console.error);
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  api
    .changeAvatar({
      avatar: avatarLinkInput.value,
    })
    .then((user) => {
      profileAvatar.src = user.avatar;
      avatarForm.reset();
      resetValidation(avatarForm, [avatarLinkInput], validationConfig);
      closeModal(avatarModal);
    })
    .catch(console.error);
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
