<template>
    <footer class="footer">
        <div class="container">
            <div class="team-info">
                <h3>project team members</h3>
                <ul class="team-list">
                    <li>Cui Yinuo G2501867B</li>
                    <li>Zhang Qisen G2502030E</li>
                    <li>Chen Sifan G2501980K</li>
                    <li>Jin Jiayu G2501694A</li>
                    <li>Chen Gonghe G2506644D</li>
                    <li>Zhang Muzi G2503498B</li>
                    <li>Wen Yuhan G2501947H</li>
                </ul>
            </div>
            <div class="copyright">
                <p>&copy; {{ currentYear }} Twitter-like Project</p>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: "AppFooter",
    computed: {
        currentYear() {
            return new Date().getFullYear();
        },
    },
};
</script>

<style scoped>
.footer {
    margin-top: 40px;
    padding: 20px 0;
    background-color: #f8f9fa;
    border-top: 1px solid var(--border-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

.team-info {
    margin-bottom: 20px;
}

.team-info h3 {
    font-size: 18px;
    margin-bottom: 16px;
    color: var(--text-color);
    text-align: center;
    font-weight: 600;
}

.team-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 0;
    margin: 0;
    list-style: none;
    justify-content: center;
}

.team-list li {
    background-color: #e9f3fd;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 14px;
    color: var(--text-secondary);
    transition: all 0.2s ease;
}

.team-list li:hover {
    background-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
}

.copyright {
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
    margin-top: 20px;
}
/* responsive design */
@media (max-width: 768px) {
    .team-list {
        flex-direction: column;
        gap: 8px;
    }

    .team-list li {
        font-size: 12px;
    }
}
</style>
