// vite.config.js
import { defineConfig } from "file:///C:/Users/mi_ra/OneDrive/Documents/GitHub/snapmenu/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/mi_ra/OneDrive/Documents/GitHub/snapmenu/node_modules/@vitejs/plugin-react/dist/index.mjs";
import wasm from "file:///C:/Users/mi_ra/OneDrive/Documents/GitHub/snapmenu/node_modules/vite-plugin-wasm/exports/import.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), wasm()],
  resolve: {
    alias: {
      "@": "/src",
      "react": "react"
    }
  },
  optimizeDeps: {
    include: ["client-vector-search", "@xenova/transformers", "react", "react-dom"],
    esbuildOptions: {
      target: "esnext"
    }
  },
  build: {
    target: "esnext",
    commonjsOptions: {
      include: [/client-vector-search/, /@xenova\/transformers/]
    }
  },
  server: {
    port: 5176,
    fs: {
      // Allow serving files from node_modules
      allow: [".."]
    },
    headers: {
      // Required for loading WASM modules
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtaV9yYVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHNuYXBtZW51XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtaV9yYVxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXHNuYXBtZW51XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9taV9yYS9PbmVEcml2ZS9Eb2N1bWVudHMvR2l0SHViL3NuYXBtZW51L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB3YXNtIGZyb20gXCJ2aXRlLXBsdWdpbi13YXNtXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB3YXNtKCldLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogJy9zcmMnLFxyXG4gICAgICAncmVhY3QnOiAncmVhY3QnXHJcbiAgICB9XHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFsnY2xpZW50LXZlY3Rvci1zZWFyY2gnLCAnQHhlbm92YS90cmFuc2Zvcm1lcnMnLCAncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICB0YXJnZXQ6ICdlc25leHQnXHJcbiAgICB9XHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiBbL2NsaWVudC12ZWN0b3Itc2VhcmNoLywgL0B4ZW5vdmFcXC90cmFuc2Zvcm1lcnMvXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTc2LFxyXG4gICAgZnM6IHtcclxuICAgICAgLy8gQWxsb3cgc2VydmluZyBmaWxlcyBmcm9tIG5vZGVfbW9kdWxlc1xyXG4gICAgICBhbGxvdzogWycuLiddXHJcbiAgICB9LFxyXG4gICAgaGVhZGVyczoge1xyXG4gICAgICAvLyBSZXF1aXJlZCBmb3IgbG9hZGluZyBXQVNNIG1vZHVsZXNcclxuICAgICAgJ0Nyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3knOiAncmVxdWlyZS1jb3JwJyxcclxuICAgICAgJ0Nyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5JzogJ3NhbWUtb3JpZ2luJyxcclxuICAgICAgJ0Nyb3NzLU9yaWdpbi1SZXNvdXJjZS1Qb2xpY3knOiAnY3Jvc3Mtb3JpZ2luJ1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVYsU0FBUyxvQkFBb0I7QUFDaFgsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUdqQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUFBLEVBQ3pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUs7QUFBQSxNQUNMLFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLHdCQUF3Qix3QkFBd0IsU0FBUyxXQUFXO0FBQUEsSUFDOUUsZ0JBQWdCO0FBQUEsTUFDZCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGlCQUFpQjtBQUFBLE1BQ2YsU0FBUyxDQUFDLHdCQUF3Qix1QkFBdUI7QUFBQSxJQUMzRDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLElBQUk7QUFBQTtBQUFBLE1BRUYsT0FBTyxDQUFDLElBQUk7QUFBQSxJQUNkO0FBQUEsSUFDQSxTQUFTO0FBQUE7QUFBQSxNQUVQLGdDQUFnQztBQUFBLE1BQ2hDLDhCQUE4QjtBQUFBLE1BQzlCLGdDQUFnQztBQUFBLElBQ2xDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
