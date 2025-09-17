<template>
    <div class="post-form-container">
        <form @submit.prevent="submitPost" class="post-form">
            <div class="form-header">
                <div class="user-avatar">
                    <img
                        v-if="currentUser && currentUser.avatar"
                        :src="getAvatarUrl(currentUser.avatar)"
                        class="avatar-image"
                    />
                    <span v-else>{{ userInitial }}</span>
                </div>
                <textarea
                    v-model="content"
                    placeholder=""
                    :rows="textareaRows"
                    ref="postTextarea"
                ></textarea>
            </div>

            <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Image Preview" />
                <button type="button" class="remove-image" @click="removeImage">
                    &times;
                </button>
            </div>

            <div class="form-actions">
                <!-- upload pic -->
                <div class="form-tools">
                    <label class="upload-image-btn">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            @change="handleImageUpload"
                            ref="imageInput"
                            :disabled="!!imageFile || submitting"
                        />
                        <span class="icon">📷</span>
                    </label>
                </div>

                <div class="form-right">
                    <span
                        class="char-count"
                        :class="{ 'limit-exceeded': isCharLimitExceeded }"
                    >
                        {{ content.length }}/280
                    </span>
                    <button
                        type="submit"
                        :disabled="!isValid || submitting"
                        class="post-button"
                    >
                        publish
                    </button>
                </div>
            </div>

            <div v-if="error" class="error-message">
                {{ error }}
            </div>
        </form>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "PostForm",
    data() {
        return {
            content: "",
            textareaRows: 2,
            submitting: false,
            error: "",
            charLimit: 280,
            imageFile: null,
            imagePreview: null,
        };
    },
    computed: {
        ...mapGetters({
            currentUser: "currentUser",
        }),
        userInitial() {
            return this.currentUser
                ? this.currentUser.username.charAt(0).toUpperCase()
                : "?";
        },
        isValid() {
            // Contains content or images, content does not exceed the character limit
            return (
                (this.content.trim().length > 0 || this.imageFile) &&
                this.content.length <= this.charLimit
            );
        },
        isCharLimitExceeded() {
            return this.content.length > this.charLimit;
        },
    },
    methods: {
        getAvatarUrl(avatarPath) {
            if (!avatarPath) return null;

            // a complete URL, return directly
            if (avatarPath.startsWith("http")) {
                return avatarPath;
            }

            // contains uploads, use the fully qualified path
            if (avatarPath.includes("uploads/")) {
                return `http://localhost:3000/${avatarPath}`;
            }

            // build the full URL
            return `http://localhost:3000${avatarPath}`;
        },

        async submitPost() {
            if (!this.isValid || this.submitting) {
                return;
            }

            this.submitting = true;
            this.error = "";

            try {
                // Verify login status
                const token = localStorage.getItem("token");
                if (!token) {
                    this.error = "need login ";
                    console.error("cant find token");
                    return;
                }

                // contain text and images
                const formData = new FormData();
                formData.append("content", this.content);

                if (this.imageFile) {
                    formData.append("image", this.imageFile);
                }

                // submit by formdata
                await this.$store.dispatch("createPostWithImage", formData);
                console.log("submitted successfully");

                // Reset Form
                this.content = "";
                this.textareaRows = 2;
                this.removeImage();

                this.$emit("post-created");
            } catch (error) {
                if (error.response) {
                    this.error = `publish fail: ${error.response.status} - ${
                        error.response.data.message || "Server Error"
                    }`;
                } else {
                    this.error = `publish fail: ${error.message}`;
                }
            } finally {
                this.submitting = false;
            }
        },

        handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                this.error = "image size cannot exceed 5MB";
                this.$refs.imageInput.value = "";
                return;
            }

            const validTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/jpg",
            ];
            if (!validTypes.includes(file.type)) {
                this.error = "Only JPG, PNG and GIF images are supported";
                this.$refs.imageInput.value = "";
                return;
            }

            this.imageFile = file;
            this.createImagePreview(file);
        },

        createImagePreview(file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                this.imagePreview = e.target.result;
            };
        },

        removeImage() {
            this.imageFile = null;
            this.imagePreview = null;

            if (this.$refs.imageInput) {
                this.$refs.imageInput.value = "";
            }
        },
    },
};
</script>

<style scoped>
.post-form-container {
    background-color: white;
    padding: 16px;
}

.post-form {
    width: 100%;
}

.form-header {
    display: flex;
    margin-bottom: 16px;
}

.user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    font-size: 20px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
}

textarea {
    flex-grow: 1;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 16px;
    resize: none;
    outline: none;
    transition: border-color 0.2s ease;
    font-family: inherit;
}

textarea:focus {
    border-color: var(--primary-color);
}

.form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-tools {
    display: flex;
    align-items: center;
}

.form-right {
    display: flex;
    align-items: center;
}

.char-count {
    color: var(--text-secondary);
    font-size: 14px;
    margin-right: 16px;
}

.upload-image-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: var(--primary-color);
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.upload-image-btn:hover {
    background-color: rgba(29, 161, 242, 0.1);
}

.upload-image-btn input[type="file"] {
    display: none;
}

.upload-image-btn .icon {
    font-size: 22px;
}

.image-preview {
    position: relative;
    margin: 12px 0;
    max-width: 100%;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border-color);
}

.image-preview img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
}

.remove-image {
    position: absolute;
    top: 8px;
    right: 8px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.limit-exceeded {
    color: var(--danger-color);
}

.post-button {
    background-color: var(--primary-color);
    color: white;
    font-weight: bold;
    padding: 8px 20px;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.post-button:hover:not(:disabled) {
    background-color: #1a91da;
}

.post-button:disabled {
    background-color: #a0d1f1;
    cursor: not-allowed;
}

.error-message {
    margin-top: 12px;
    color: var(--danger-color);
    font-size: 14px;
}
</style>
