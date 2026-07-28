document.addEventListener("DOMContentLoaded", () => {
  const currentUser = {
    image: {
      png: "./images/avatars/image-juliusomo.png",
      webp: "./images/avatars/image-juliusomo.webp"
    },
    username: "juliusomo"
  };

  const commentsContainer = document.querySelector(".comments-list");
  const deleteModal = document.getElementById("deleteModal");
  const btnCancel = document.querySelector(".btn-cancel");
  const btnConfirmDelete = document.querySelector(".btn-confirm-delete");

  let commentToDelete = null;

  // ==========================================
  // 1. EVENT DELEGATION: Score, Reply, Edit, Delete
  // ==========================================
  commentsContainer.addEventListener("click", (e) => {
    
    // A. SCORE COUNTER (Upvote / Downvote)
    const scoreBtn = e.target.closest(".btn-score");
    if (scoreBtn) {
      const card = scoreBtn.closest(".comment-card");
      const scoreValue = card.querySelector(".score-value");
      const currentScore = parseInt(scoreValue.textContent, 10);

      if (scoreBtn.classList.contains("btn-plus")) {
        scoreValue.textContent = currentScore + 1;
      } else if (scoreBtn.classList.contains("btn-minus") && currentScore > 0) {
        scoreValue.textContent = currentScore - 1;
      }
      return;
    }

    // B. TOMBOL REPLY
    const replyBtn = e.target.closest(".btn-reply");
    if (replyBtn) {
      const parentCard = replyBtn.closest(".comment-card");
      const targetUsername = parentCard.querySelector(".username").textContent;

      // Gunakan CONST (memperbaiki warning linter)
      const existingReplyBox = parentCard.nextElementSibling;
      if (existingReplyBox && existingReplyBox.classList.contains("reply-input-wrapper")) {
        existingReplyBox.remove();
        return;
      }

      const replyFormCard = document.createElement("div");
      replyFormCard.className = "add-comment-section reply-input-wrapper";
      replyFormCard.innerHTML = `
        <form class="comment-form reply-form">
          <picture>
            <source srcset="${currentUser.image.webp}" type="image/webp">
            <img src="${currentUser.image.png}" alt="${currentUser.username} avatar" class="avatar">
          </picture>
          <textarea class="comment-input" placeholder="Add a reply..." rows="3" aria-label="Add a reply">@${targetUsername} </textarea>
          <button type="submit" class="btn-submit">REPLY</button>
        </form>
      `;

      parentCard.after(replyFormCard);

      const textarea = replyFormCard.querySelector("textarea");
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      // Submit Reply Form
      const form = replyFormCard.querySelector("form");
      form.addEventListener("submit", (evt) => {
        evt.preventDefault();
        const rawText = textarea.value.trim();
        if (!rawText) return;

        const textWithoutMention = rawText.replace(`@${targetUsername}`, "").trim();

        const newReplyCard = document.createElement("article");
        newReplyCard.className = "comment-card my-comment";
        newReplyCard.innerHTML = `
          <div class="score-counter">
            <button type="button" class="btn-score btn-plus" aria-label="Upvote comment">
              <img src="./images/icon-plus.svg" alt="" aria-hidden="true">
            </button>
            <span class="score-value">0</span>
            <button type="button" class="btn-score btn-minus" aria-label="Downvote comment">
              <img src="./images/icon-minus.svg" alt="" aria-hidden="true">
            </button>
          </div>

          <div class="comment-content">
            <header class="comment-header">
              <div class="user-info">
                <picture>
                  <source srcset="${currentUser.image.webp}" type="image/webp">
                  <img src="${currentUser.image.png}" alt="${currentUser.username} avatar" class="avatar">
                </picture>
                <span class="username">${currentUser.username}</span>
                <span class="badge-you">you</span>
                <span class="time-ago">Just now</span>
              </div>
              <div class="user-actions">
                <button type="button" class="btn-delete">
                  <img src="./images/icon-delete.svg" alt="" aria-hidden="true">
                  Delete
                </button>
                <button type="button" class="btn-edit">
                  <img src="./images/icon-edit.svg" alt="" aria-hidden="true">
                  Edit
                </button>
              </div>
            </header>

            <p class="comment-text">
              <span class="replying-to">@${targetUsername}</span> ${textWithoutMention}
            </p>
          </div>
        `;

        let repliesWrapper = parentCard.nextElementSibling;
        if (!repliesWrapper || !repliesWrapper.classList.contains("replies-wrapper")) {
          if (parentCard.parentElement.classList.contains("replies-wrapper")) {
            repliesWrapper = parentCard.parentElement;
          } else {
            repliesWrapper = document.createElement("div");
            repliesWrapper.className = "replies-wrapper";
            replyFormCard.after(repliesWrapper);
          }
        }

        repliesWrapper.appendChild(newReplyCard);
        replyFormCard.remove();
      });
      return;
    }

    // C. TOMBOL EDIT
    const editBtn = e.target.closest(".btn-edit");
    if (editBtn) {
      const card = editBtn.closest(".comment-card");
      const contentContainer = card.querySelector(".comment-content");
      const pText = contentContainer.querySelector(".comment-text");

      if (contentContainer.querySelector(".edit-box-wrapper")) return;

      const replyingToSpan = pText.querySelector(".replying-to");
      const replyingToText = replyingToSpan ? replyingToSpan.textContent : "";
      const originalText = pText.textContent.replace(replyingToText, "").trim();

      pText.style.display = "none";

      const editWrapper = document.createElement("div");
      editWrapper.className = "edit-box-wrapper";
      editWrapper.innerHTML = `
        <textarea class="comment-input edit-input" rows="3" aria-label="Edit comment">${replyingToText ? replyingToText + ' ' : ''}${originalText}</textarea>
        <button type="button" class="btn-submit btn-update">UPDATE</button>
      `;

      contentContainer.appendChild(editWrapper);

      const updateBtn = editWrapper.querySelector(".btn-update");
      updateBtn.addEventListener("click", () => {
        const updatedValue = editWrapper.querySelector("textarea").value.trim();
        
        if (replyingToSpan) {
          const cleanText = updatedValue.replace(replyingToText, "").trim();
          pText.innerHTML = `<span class="replying-to">${replyingToText}</span> ${cleanText}`;
        } else {
          pText.textContent = updatedValue;
        }

        pText.style.display = "block";
        editWrapper.remove();
      });
      return;
    }

    // D. TOMBOL DELETE (MEMBUKA MODAL)
    const deleteBtn = e.target.closest(".btn-delete");
    if (deleteBtn) {
      commentToDelete = deleteBtn.closest(".comment-card");
      deleteModal.showModal();
    }
  });

  // ==========================================
  // 2. KONTROL MODAL DELETE
  // ==========================================
  btnCancel.addEventListener("click", () => {
    deleteModal.close();
    commentToDelete = null;
  });

  btnConfirmDelete.addEventListener("click", () => {
    if (commentToDelete) {
      commentToDelete.remove();
      commentToDelete = null;
    }
    deleteModal.close();
  });

  deleteModal.addEventListener("click", (e) => {
    const dialogBounds = deleteModal.getBoundingClientRect();
    if (
      e.clientX < dialogBounds.left ||
      e.clientX > dialogBounds.right ||
      e.clientY < dialogBounds.top ||
      e.clientY > dialogBounds.bottom
    ) {
      deleteModal.close();
    }
  });

  // ==========================================
  // 3. TAMBAH KOMENTAR UTAMA
  // ==========================================
  const mainForm = document.querySelector(".comment-form");
  mainForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const textarea = mainForm.querySelector("textarea");
    const text = textarea.value.trim();
    if (!text) return;

    const newComment = document.createElement("article");
    newComment.className = "comment-card my-comment";
    newComment.innerHTML = `
      <div class="score-counter">
        <button type="button" class="btn-score btn-plus" aria-label="Upvote comment">
          <img src="./images/icon-plus.svg" alt="" aria-hidden="true">
        </button>
        <span class="score-value">0</span>
        <button type="button" class="btn-score btn-minus" aria-label="Downvote comment">
          <img src="./images/icon-minus.svg" alt="" aria-hidden="true">
        </button>
      </div>

      <div class="comment-content">
        <header class="comment-header">
          <div class="user-info">
            <picture>
              <source srcset="${currentUser.image.webp}" type="image/webp">
              <img src="${currentUser.image.png}" alt="${currentUser.username} avatar" class="avatar">
            </picture>
            <span class="username">${currentUser.username}</span>
            <span class="badge-you">you</span>
            <span class="time-ago">Just now</span>
          </div>
          <div class="user-actions">
            <button type="button" class="btn-delete">
              <img src="./images/icon-delete.svg" alt="" aria-hidden="true">
              Delete
            </button>
            <button type="button" class="btn-edit">
              <img src="./images/icon-edit.svg" alt="" aria-hidden="true">
              Edit
            </button>
          </div>
        </header>

        <p class="comment-text">${text}</p>
      </div>
    `;

    commentsContainer.appendChild(newComment);
    textarea.value = "";
  });
});
