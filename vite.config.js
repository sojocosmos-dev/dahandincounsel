import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        teacherReport: resolve(__dirname, 'teacher-report.html'),
        teacherSubmissions: resolve(__dirname, 'teacher-submissions.html'),
        studentCounselSelect: resolve(__dirname, 'student-counsel-select.html'),
        studentReport: resolve(__dirname, 'student-report.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
