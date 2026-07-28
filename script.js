document.addEventListener("DOMContentLoaded", () => {
  const deleteModal = document.getElementById("deleteModal");
  const btnDeleteList = document.querySelectorAll(".btn-delete");
  const btnCancel = document.querySelector(".btn-cancel");
  const btnConfirmDelete = document.querySelector(".btn-confirm-delete");

  let commentToDelete = null;

  // 1. Buka Modal ketika tombol Delete pada komentar diklik
  btnDeleteList.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Menyimpan elemen komentar yang ingin dihapus
      commentToDelete = e.target.closest(".comment-card");
      
      // Tampilkan modal sebagai dialog modal (dengan backdrop)
      deleteModal.showModal();
    });
  });

  // 2. Tutup Modal saat tombol "NO, CANCEL" diklik
  btnCancel.addEventListener("click", () => {
    deleteModal.close();
    commentToDelete = null;
  });

  // 3. Hapus Komentar & Tutup Modal saat "YES, DELETE" diklik
  btnConfirmDelete.addEventListener("click", () => {
    if (commentToDelete) {
      commentToDelete.remove();
      commentToDelete = null;
    }
    deleteModal.close();
  });

  // 4. Tutup Modal jika pengguna mengklik area luar modal (backdrop)
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
});

document.addEventListener("DOMContentLoaded", () => {
  // Data user saat ini (CurrentUser)
  const currentUser = {
    image: {
      png: "./images/avatars/image-juliusomo.png",
      webp: "./images/avatars/image-juliusomo.webp"
    },
    username: "juliusomo"
  };

  const commentsContainer = document.querySelector(".comments-list");

  // ==========================================
  // 1. FITUR REPLY (Dinamis)
  // ==========================================
  commentsContainer.addEventListener("click", (e) => {
    const replyBtn = e.target.closest(".btn-reply");
    if (!replyBtn) return;

    const parentCard = replyBtn.closest(".comment-card");
    const targetUsername = parentCard.querySelector(".username").textContent;

    // Cek jika form reply sudah ada agar tidak duplikat
    let existingReplyBox = parentCard.nextElementSibling;
    if (existingReplyBox && existingReplyBox.classList.contains("reply-input-wrapper")) {
      existingReplyBox.remove();
      return;
    }

    // Buat elemen form reply
    const replyFormCard = document.createElement("div");
    replyFormCard.className = "add-comment-section reply-input-wrapper";
    replyFormCard.innerHTML = `
      <form class="comment-form reply-form">
        <picture>
          <source srcset="${currentUser.image.webp}" type="image/webp">
          <img src="${currentUser.image.png}" alt="${currentUser.username}" class="avatar">
        </picture>
        <textarea class="comment-input" placeholder="Add a reply..." rows="3">@${targetUsername} </textarea>
        <button type="submit" class="btn-submit">REPLY</button>
      </form>
    `;

    // Sisipkan form reply di bawah kartu komentar yang diklik
    parentCard.after(replyFormCard);

    // Memicu fokus ke textarea
    const textarea = replyFormCard.querySelector("textarea");
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    // Event kirim balasan
    const form = replyFormCard.querySelector("form");
    form.addEventListener("submit", (evt) => {
      evt.preventDefault();
      const rawText = textarea.value.trim();
      if (!rawText) return;

      // Pisahkan tag @username dan isi teks
      const textWithoutMention = rawText.replace(`@${targetUsername}`, "").trim();

      // Buat kartu balasan baru
      const newReplyCard = document.createElement("article");
      newReplyCard.className = "comment-card my-comment";
      newReplyCard.innerHTML = `
        <div class="score-counter">
          <button class="btn-score" aria-label="Upvote comment">
            <img src="./images/icon-plus.svg" alt="" aria-hidden="true">
          </button>
          <span class="score-value">0</span>
          <button class="btn-score" aria-label="Downvote comment">
            <img src="./images/icon-minus.svg" alt="" aria-hidden="true">
          </button>
        </div>

        <div class="comment-content">
          <header class="comment-header">
            <div class="user-info">
              <picture>
                <source srcset="${currentUser.image.webp}" type="image/webp">
                <img src="${currentUser.image.png}" alt="${currentUser.username}" class="avatar">
              </picture>
              <span class="username">${currentUser.username}</span>
              <span class="badge-you">you</span>
              <span class="time-ago">Just now</span>
            </div>
            <div class="user-actions">
              <button class="btn-delete">
                <img src="./images/icon-delete.svg" alt="" aria-hidden="true">
                Delete
              </button>
              <button class="btn-edit">
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

      // Cari atau buat container .replies-wrapper
      let repliesWrapper = parentCard.nextElementSibling;
      if (!repliesWrapper || !repliesWrapper.classList.contains("replies-wrapper")) {
        // Jika belum ada replies-wrapper (komentar utama), buat baru
        if (parentCard.parentElement.classList.contains("replies-wrapper")) {
          repliesWrapper = parentCard.parentElement;
        } else {
          repliesWrapper = document.createElement("div");
          repliesWrapper.className = "replies-wrapper";
          replyFormCard.after(repliesWrapper);
        }
      }

      repliesWrapper.appendChild(newReplyCard);
      replyFormCard.remove(); // Hapus form reply setelah berhasil dikirim
    });
  });

  // ==========================================
  // 2. FITUR EDIT & UPDATE (Dinamis)
  // ==========================================
  commentsContainer.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    if (!editBtn) return;

    const card = editBtn.closest(".comment-card");
    const contentContainer = card.querySelector(".comment-content");
    const pText = contentContainer.querySelector(".comment-text");

    // Jika sedang dalam mode edit, jangan buat textarea ganda
    if (contentContainer.querySelector(".edit-box-wrapper")) return;

    // Ambil mention @username dan teks murni
    const replyingToSpan = pText.querySelector(".replying-to");
    const replyingToText = replyingToSpan ? replyingToSpan.textContent : "";
    const originalText = pText.textContent.replace(replyingToText, "").trim();

    // Sembunyikan elemen paragraph asli
    pText.style.display = "none";

    // Buat form edit
    const editWrapper = document.createElement("div");
    editWrapper.className = "edit-box-wrapper";
    editWrapper.innerHTML = `
      <textarea class="comment-input edit-input" rows="3">${replyingToText ? replyingToText + ' ' : ''}${originalText}</textarea>
      <button class="btn-submit btn-update">UPDATE</button>
    `;

    contentContainer.appendChild(editWrapper);

    // Event tombol UPDATE
    const updateBtn = editWrapper.querySelector(".btn-update");
    updateBtn.addEventListener("click", () => {
      const updatedValue = editWrapper.querySelector("textarea").value.trim();
      
      if (replyingToSpan) {
        const cleanText = updatedValue.replace(replyingToText, "").trim();
        pText.innerHTML = `<span class="replying-to">${replyingToText}</span> ${cleanText}`;
      } else {
        pText.textContent = updatedValue;
      }

      // Tampilkan kembali paragraph asli dan hapus box edit
      pText.style.display = "block";
      editWrapper.remove();
    });
  });
});