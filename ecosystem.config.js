module.exports = {
    apps : [
      {
        name: "dev116-dev",
        script: "npm",
        args: "run dev"
      },
      {
        name: "dev116-prod",
        script: "npm",
        args: "run start"
      }
    ]
  }