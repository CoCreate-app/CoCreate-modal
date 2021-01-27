module.exports = {
    socket: {
        config: {
            apiKey: "c2b08663-06e3-440c-ef6f-13978b42883a",
            securityKey: "f26baf68-e3a9-45fc-effe-502e47116265",
            organization_Id: "5de0387b12e200ea63204d6c"
        },
        host: "server.cocreate.app:8088"
    },

    sources: [{
            path: "./docs/index.html",
            collection: "website-pages",
            document_id: "",
            name: "html",
        },
    ],
   
    crud: [{
            collection: "routes",
            document_id: "",
            data:{collection: "website-pages",
                document_id: "",
                domains: ["general.cocreate.app"],
                route: "/docs/modal",
            }
        }
    ],
    
    extract: {
        directory: "./src/",
        extensions: [
            "js",
            "css",
            "html"
        ],
        ignores: [
            "node_modules",
            "vendor",
            "bower_components",
            "archive"
        ],
    }
}
