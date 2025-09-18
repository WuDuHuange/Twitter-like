<template>
    <div class="profile-edit-modal" v-if="show">
        <div class="modal-overlay" @click="closeModal"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit your profile</h2>
                <button class="close-button" @click="closeModal">
                    &times;
                </button>
            </div>

            <div class="modal-body">
                <form @submit.prevent="saveChanges">
                    <!-- upload avatar -->
                    <div class="avatar-section">
                        <h3>change avatar</h3>
                        <div class="avatar-upload">
                            <div class="avatar-preview" :style="previewStyle">
                                <span v-if="!imagePreview && !user.avatar">{{
                                    userInitial
                                }}</span>
                            </div>

                            <div class="avatar-actions">
                                <label class="upload-button">
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/png, image/gif"
                                        @change="handleImageUpload"
                                        ref="avatarInput"
                                    />
                                    <span>choose picture</span>
                                </label>
                                <button
                                    type="button"
                                    class="remove-button"
                                    @click="removeImage"
                                    v-if="imagePreview || user.avatar"
                                >
                                    remove picture
                                </button>
                            </div>
                        </div>

                        <p class="field-helper">
                            Supports JPG, PNG or GIF, up to 5MB
                        </p>
                        <p class="error-message" v-if="errors.avatar">
                            {{ errors.avatar }}
                        </p>
                    </div>

                    <div class="username-section" v-if="!isWalletUser">
                        <h3>change username</h3>
                        <div class="form-group">
                            <input
                                type="text"
                                v-model="username"
                                placeholder="username"
                                :class="{ 'has-error': errors.username }"
                                :disabled="isWalletUser"
                            />
                            <p class="field-helper">
                                Your username will be displayed on your profile
                                and in your posts.
                            </p>
                            <p class="error-message" v-if="errors.username">
                                {{ errors.username }}
                            </p>
                        </div>
                    </div>

                    <p class="wallet-user-note" v-if="isWalletUser">
                        Note: MetaMask accounts cannot modify their usernames.
                    </p>

                    <!-- button -->
                    <div class="form-actions">
                        <button
                            type="button"
                            class="cancel-button"
                            @click="closeModal"
                        >
                            cancel
                        </button>
                        <button
                            type="submit"
                            class="save-button"
                            :disabled="loading"
                        >
                            <span v-if="loading">saving...</span>
                            <span v-else>save</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "ProfileEdit",
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        user: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            username: "",
            imageFile: null,
            imagePreview: null,
            loading: false,
            errors: {
                username: "",
                avatar: "",
            },
        };
    },
    computed: {
        userInitial() {
            return this.username
                ? this.username.charAt(0).toUpperCase()
                : this.user.username
                ? this.user.username.charAt(0).toUpperCase()
                : "?";
        },
        isWalletUser() {
            return (
                this.user &&
                this.user.wallet_address &&
                this.user.wallet_address.length > 0
            );
        },
        previewStyle() {
            if (this.imagePreview) {
                return {
                    backgroundImage: `url(${this.imagePreview})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                };
            } else if (this.user.avatar) {
                return {
                    backgroundImage: `url(${this.user.avatar})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                };
            }

            return {
                backgroundColor: "var(--primary-color)",
            };
        },
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.initializeForm();
            }
        },
    },
    methods: {
        initializeForm() {
            this.username = this.user.username || "";
            this.imageFile = null;
            this.imagePreview = null;
            this.errors = {
                username: "",
                avatar: "",
            };
        },

        handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const validTypes = [
                "image/jpeg",
                "image/png",
                "image/gif",
                "image/jpg",
            ];
            if (!validTypes.includes(file.type)) {
                this.errors.avatar = "Unsupported file format";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.errors.avatar =
                    "The file is too large, please select an image smaller than 5MB";
                return;
            }

            this.imageFile = file;
            this.errors.avatar = "";

            // preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        removeImage() {
            this.imageFile = null;
            this.imagePreview = null;
            if (this.$refs.avatarInput) {
                this.$refs.avatarInput.value = "";
            }
        },

        validateForm() {
            let isValid = true;

            if (!this.isWalletUser) {
                if (!this.username.trim()) {
                    this.errors.username = "Username cannot be empty";
                    isValid = false;
                } else if (this.username.length < 3) {
                    this.errors.username =
                        "Username must be at least 3 characters";
                    isValid = false;
                } else if (this.username.length > 20) {
                    this.errors.username =
                        "Username cannot exceed 20 characters";
                    isValid = false;
                }
            }

            return isValid;
        },

        async saveChanges() {
            if (!this.validateForm()) return;

            this.loading = true;

            try {
                const formData = new FormData();

                if (this.imageFile) {
                    formData.append("avatar", this.imageFile);
                }

                if (
                    !this.isWalletUser &&
                    this.username !== this.user.username
                ) {
                    formData.append("username", this.username);
                }

                const response = await axios.put(
                    `http://localhost:3000/api/users/${this.user.id}/profile`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );

                this.$emit("profile-updated", response.data);
                this.closeModal();
            } catch (error) {
                if (error.response) {
                    if (error.response.data.message) {
                        if (error.response.data.message.includes("username")) {
                            this.errors.username = error.response.data.message;
                        } else {
                            this.errors.avatar = error.response.data.message;
                        }
                    } else {
                        this.errors.username =
                            "Failed to save, please try again later";
                    }
                } else {
                    this.errors.username =
                        "Network error, please check the network connection";
                }
            } finally {
                this.loading = false;
            }
        },

        closeModal() {
            this.$emit("close");
        },
    },
};
</script>

<style scoped>
.profile-edit-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
}

.modal-content {
    position: relative;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    overflow-y: auto;
    z-index: 1001;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
    font-size: 20px;
    font-weight: 600;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
}

.modal-body {
    padding: 20px;
}

.avatar-section,
.username-section {
    margin-bottom: 24px;
}

h3 {
    font-size: 16px;
    margin-bottom: 12px;
    font-weight: 600;
}

.avatar-upload {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.avatar-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 36px;
    font-weight: bold;
    background-color: var(--primary-color);
}

.avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.upload-button {
    display: block;
    padding: 8px 16px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 999px;
    cursor: pointer;
    text-align: center;
    font-weight: 500;
}

.upload-button input {
    position: absolute;
    left: -9999px;
}

.remove-button {
    background-color: transparent;
    color: var(--danger-color);
    border: 1px solid var(--danger-color);
    padding: 8px 16px;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 500;
}

.form-group {
    margin-bottom: 16px;
}

input[type="text"] {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 16px;
}

input[type="text"].has-error {
    border-color: var(--danger-color);
}

input[type="text"]:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.field-helper {
    color: var(--text-secondary);
    font-size: 12px;
    margin-top: 4px;
}

.error-message {
    color: var(--danger-color);
    font-size: 14px;
    margin-top: 4px;
}

.wallet-user-note {
    background-color: #f8f9fa;
    padding: 12px;
    border-radius: 4px;
    border-left: 4px solid var(--primary-color);
    margin-bottom: 24px;
    font-size: 14px;
    color: var(--text-secondary);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
}

.cancel-button {
    background-color: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.save-button {
    background-color: var(--primary-color);
    color: white;
}

.save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 480px) {
    .modal-content {
        max-width: 95%;
    }

    .avatar-upload {
        flex-direction: column;
    }

    .avatar-preview {
        margin-right: 0;
        margin-bottom: 16px;
    }
}
</style>
