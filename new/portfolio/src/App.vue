<template>
    <div class="container">
        <!--<div class="row">-->
        <nav class="navbar">
            <ul>
                <li
                    v-for="(page, index) in pages"
                    :key="index"
                    :class="navClass(page)"
                >
                    <inline-svg
                        v-if="page.icon"
                        class="nav-icon"
                        :src="navIcon(page)"
                    />
                    <span class="title">{{ page.title }}</span>
                </li>
            </ul>
        </nav>
        <!--</div>-->
        <!--
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div
                    class="collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a
                                class="nav-link active"
                                aria-current="page"
                                href="#"
                                >Home</a
                            >
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Link</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a
                                class="nav-link dropdown-toggle"
                                href="#"
                                id="navbarDropdown"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Dropdown
                            </a>
                            <ul
                                class="dropdown-menu"
                                aria-labelledby="navbarDropdown"
                            >
                                <li>
                                    <a class="dropdown-item" href="#">Action</a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#"
                                        >Another action</a
                                    >
                                </li>
                                <li><hr class="dropdown-divider" /></li>
                                <li>
                                    <a class="dropdown-item" href="#"
                                        >Something else here</a
                                    >
                                </li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a
                                class="nav-link disabled"
                                href="#"
                                tabindex="-1"
                                aria-disabled="true"
                                >Disabled</a
                            >
                        </li>
                    </ul>
                </div>
            </div>
        </nav>-->

        <!--<component :is="mainView" />-->
    </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import InlineSvg from 'vue-inline-svg'

export default {
    name: 'App',
    components: {
        //HelloWorld,
        InlineSvg,
    },
    data() {
        return {
            pages: [
                {
                    title: 'Accueil',
                    active: true,
                    icon: 'user-solid.svg',
                    view: 'Home',
                },
                { title: 'CV', icon: 'file-alt-solid.svg', view: 'Resume' },
                {
                    title: 'Réalisations',
                    icon: 'folder-open-solid.svg',
                    view: 'Projects',
                },
                {
                    title: 'Contact',
                    icon: 'envelope-solid.svg',
                    view: 'Contact',
                },
            ],
        }
    },
    methods: {
        navClass(page) {
            return page.active ? 'nav-item-active' : 'nav-item'
        },
        navIcon(page) {
            return page.icon ? require('@/assets/nav-icons/' + page.icon) : ''
        },
    },
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;

    --clr-primary: red;
}

/*nav ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}*/

/*.nav-item-active {
    font-weight: bold;
}

.nav-link {
    cursor: pointer;
}*/

/*.nav-item:hover {
    background-color: var(--clr-primary);
}*/

.nav-icon {
    width: 2rem;
    height: 2rem;
    /*color: red;*/
    /*fill: green;*/
}

/*.nav-icon,
.nav-icon path {
    fill: green;
}*/
</style>
