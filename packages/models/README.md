### Models

* Function of the package

  The models is named **@mitter-io/models** . This package contains the models for the entities (Users, channels and  messages) used by the mitter.io backend and the models
  for supporting messaging related functionalities .
  
  This package also contains some util functions and predicates to distinguish between the types of payload sent by the mitter.io server. 
  
  This package is used by all the other core packages(web, react-native, node and react-scl).

* How to add a new model

  Make a file named after your model that you are going to add , or a folder if you want to club in multiple models . 
  
  Usually the convention to follow  is if you have a model that the user might try to make an object of , (for eg for creating a channel , he might try to make an object out of the Channel Class model ) then it is better to make the model a class.
  
  But if the user is going to use a model just for type-checking (for eg the response received on creating a channel ) , then it is better we have it as a type or as an interface (eg: type ChannelResponse = {channelId: string})

* Adding new models as an export

  The models package exports all models in src/mitter-models.ts . Please make sure to export all the new models from here .
  Then you can run `yarn start` to get the updated code 
