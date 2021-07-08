export default {
  dataLoss: {
    timeInterval: {
      value: 60,
      name: "The time period is considered loss of data (minutes)",
      description: "If after this time the data is not sent to the server, the station will have a status of data loss. Hour"
    }
  },
  exceededPreparing: {
      value: 90,
      name: "Warning of exceeded preparing (%)",
      description: "If the value of the parameter compared to MAX, greater than or equal to this ratio, the system will warning exceeded preparing"
  },
  exceededTendency: {
      from: {
          value: 90,
          name: "Warning of exceeded tendency from value (%)",
          description: ""
      },
      to: {
          value: 80,
          name: "Warning of exceeded tendency to value (%)",
          description: ""
      }
  },
  intervalSendAlert: {
      value: 15,
      name: "Time for sending alerts (minutes)",
      description: "It is the minimum time between two times warnings, if the warning that the value of the parameter continues to exceed the threshold and beyond this time period will warning"
  }
}
