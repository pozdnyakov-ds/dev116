<template>
    <div class="container">
        <div class="large-12 medium-12 small-12 cell">
                <img v-bind:src="imagePreviewDefault" v-if="showPreview" 
                    @error="imagePreviewDefault='/img/user/no-photo.png'"
                    style="border: 1px solid #ccc; border-radius: 5px; margin-bottom: 20px;" />

                <input type="file" id="file" ref="file" name="avatar" @change="handleFileUpload()"
                    accept="image/png, image/jpeg, image/bmp" style="margin-bottom: 20px;" />

                <v-btn small @click="submitFile()" :disabled="!canSave">Сохранить фото</v-btn>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            file: '',
            showPreview: true,
            imagePreview: '',
            canSave: false,
        }
    },
    computed: {
        imagePreviewDefault() {
            if (!this.imagePreview) {
                this.imagePreview = (this.$store.state.user
                    && this.$store.state.user.photo
                    && this.$store.state.user.photo.length > 0)
                    ? '/avatars/' + this.$store.state.user.photo
                    : '/img/user/no-photo.png';
            }
            return this.imagePreview;
        },
        currentUserPhoto() {
            return this.$store.state.user.photo; 
        },
    },
    methods: {
        submitFile() {
            var formData = new FormData();
            formData.append('file', this.file);
            formData.append('savedPhoto', this.currentUserPhoto);

            const token = this.$storage.getUniversal('token');
            formData.append('token', token);
            
            this.$axios.post('/users/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'cache-control': 'no-cache',
                    }
                }
            ).then((data) => {
                let avatar = data.data.avatar;
                this.$store.commit('setUserPhoto', avatar);
                                
                this.$toast.success('Изображение успешно обновлено');
                this.canSave = false;
                console.log('Изображение успешно обновлено: ', avatar);
            })
            .catch((e) => {
                this.$toast.error('Ошибка обновления изображения!');
                console.log('Ошибка обновления изображения!', e);
            });
        },

        handleFileUpload() {
            this.file = this.$refs.file.files[0];
            let reader = new FileReader();

            reader.addEventListener("load", function () {
                this.showPreview = true;
                this.imagePreview = reader.result;
            }.bind(this), false);

            if (this.file) {
                if (/\.(jpe?g|png|gif)$/i.test(this.file.name)) {
                    reader.readAsDataURL(this.file);
                    // Разблокировать кнопку сохранения
                    this.canSave = this.file.name.length;
                }
            }
        }
    }
}
</script>

<style>
div.container img {
    max-width: 200px;
    max-height: 200px;
}
</style>