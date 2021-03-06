import { forEach } from '@angular/router/src/utils/collection';
import { Component, OnInit } from '@angular/core';
import { User } from "../User";
import { Review } from "../Review";
import { Home } from "../Home";
import { StorageService } from "../storage.service";
import 'script.js';
import { AngularFireAuth } from 'angularfire2/auth';
import { ToastsManager } from 'ng2-toastr';
import { FirebaseApp } from 'angularfire2';

declare var $:any;
declare var myExtObject: any;

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  inputs: ["Review", "Tier", "Home"],
  styleUrls: ['./review.component.css'] 
})
export class ReviewComponent implements OnInit {
  colors: string[] = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
  exampleIcon1: string;
  exampleIcon2: string;
  User: User;
  Review: Review;
  Tier: number;
  Home: Home;
  ID: string;
  disabled: boolean;
  uid:string;
  op: string;
  responses: any[] = [
    { id: 0, name: "General", responses: [{ text: "False Review", tier: 0 }, { text: "Review Acknowledged", tier: 0 }, { text: "Feedback Acknowledged", tier: 0 }, { text: "One-off Incident", tier: 0 }, { text: "Investigating Issue", tier: 1 }, { text: "Issue Resolved", tier: 1 }, { text: "Isolated Issue Resolved", tier: 1 }, { text: "Fair Review", tier: 1 }, { text: "Unfair Review", tier: 1 }, { text: "Slightly Bias Review", tier: 2 }, { text: "Issue Patient Specific", tier: 2 }] },
    { id: 1, name: "Possible Issue", responses: [{ text: "Investigated Issue - Unfair Review", tier: 2 }, { text: "Investigated Issue - Changes Made", tier: 2 }, { text: "Investigated Issue - Fair Review", tier: 2 }, { text: "Outside of Homes Control", tier: 2 }, { text: "Unrealistic Patient Expectations", tier: 3 }, { text: "Unrealistic Patient Demands", tier: 3 }, { text: "Extreme Specialist Care Required", tier: 3 }, { text: "Patient Never Raised Issue to be Resolved", tier: 3 }, { text: "One-off Incident - Dealing with Client", tier: 1 }, { text: "Fair Acceptable Review", tier: 3 }] },
    { id: 2, name: "Change in Circumstances", responses: [{ text: "Change in Patient Needs", tier: 1 }, { text: "Change of Procedure Made", tier: 1 }, { text: "Change of Policies Made", tier: 1 }, { text: "Change in Patient Care Needs", tier: 2 }, { text: "Change in Patient Circumstance", tier: 3 }, { text: "Change in Patients Health Conditions", tier: 3 }, { text: "Not Disclosed on Admission", tier: 2 }, { text: "Reviewing Our Procedures", tier: 2 }, { text: "Management not notified of Issue", tier: 3 }, { text: "Reviewing Our Policies", tier: 2 }] },
    { id: 3, name: "Resident Issue", responses: [{ text: "Issue is with other Patients", tier: 3 }, { text: "Possible Issue with all Staff", tier: 3 }, { text: "Possible Issue with all Management", tier: 3 }, { text: "Not Current Patient Review", tier: 3 }, { text: "Unhappy with Funding", tier: 3 }, { text: "Not Patient Review", tier: 3 }, { text: "Not Family Member Review", tier: 3 }, { text: "Issued Caused by Patient", tier: 3 }, { text: "Issue Caused by Patient Family Actions", tier: 3 }, { text: "Billing Issue", tier: 3 }] },
  ]
  selectedResponses: any[];
  constructor(private storageService: StorageService, private afa: AngularFireAuth, public toastr: ToastsManager, private firebaseApp: FirebaseApp) {
    this.GetUser();
  }
  genIcon(): string{
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }
  CheckRating(rating: number): string {//shows stars
    if (this.Review.overall >= rating) return "yellow star icon"
    else if (this.Review.overall <= rating - 1) return "empty yellow star icon"
    else return "yellow star half empty icon"
  }
  GetUser(): void {//gets current user
    this.uid=null;
    this.afa.authState.subscribe((resp) => {
      if (resp != null) {
        if (resp.uid) {
          this.storageService.getUser(resp.uid).subscribe(user => {
            this.User = user;
            this.uid=resp.uid;
          });
        }
      }
    });
  }
  IncrementAgreed() {//increments number who agree
    this.afa.authState.subscribe((resp) => {
      if (resp != null) {
        if (resp.uid) {
          if (!this.Review.agreed.includes(resp.uid)) {
            this.Review.agreed.push(resp.uid);
          }
          if (this.Review.disagreed.includes(resp.uid)) {
            this.Review.disagreed.splice(this.Review.agreed.indexOf(resp.uid), 1);
          }
          this.storageService.UpdateReviews(this.Home,this.Review);
        }
        else{ this.showWarningLogIn()}
      }
      else{ this.showWarningLogIn()}
    });
  }
  IncrementDisagreed() {//increments number who disagree  
    this.afa.authState.subscribe((resp) => {
      if (resp != null) {
        if (resp.uid) {
          if (!this.Review.disagreed.includes(resp.uid)) {
            this.Review.disagreed.push(resp.uid);
          }
          if (this.Review.agreed.includes(resp.uid)) {
            this.Review.agreed.splice(this.Review.agreed.indexOf(resp.uid), 1);
          }
          this.storageService.UpdateReviews(this.Home,this.Review);
        }
        else{ this.showWarningLogIn()}
      }
      else{ this.showWarningLogIn()}
    });
  }
  CheckValid(): boolean {//checks if user can respond to review
    if (this.User != null) {
      if (this.TestHomes()) {
        return true;
      }
      else return false;
    }
    else return false;
  }
  LeaveReview(id): void {//sets the response of the home
    console.log(this.op);
    this.Review.response = this.op;
    this.storageService.UpdateReviews(this.Home,this.Review);//  <-- this doesn't work
    //this.ClosePopup();
    this.closeModal(id);
    this.UpdateReview();
  }
  UpdateReview(){
    //update the review in rtdb
    var reviewRef = this.firebaseApp.database().ref().child('homes/' + this.Home.ID+ '/reviews/' + this.Review.reviewID);
    reviewRef.update({response:this.op})
    reviewRef.on('value', function(snap) {
      console.log(snap.val());
    });
  }
  closeModal(id){
    $('.ui.longer.modal.respond-to-review.'+id)
            .modal('hide')
        ;
  }
  CheckResponse(): boolean {//shows response if there is one
    if (this.Review.response != "") {
      return true
    }
    else return false
  }
  CheckTier(): boolean {//checks tier
    if (this.Tier >= 3) {
      return true;
    }
    else return false
  }
  TestHomes(): boolean {//sees if the user is affilliated with the home
    if (this.Home.userID == this.uid) {
      return true;
    }
    else return false;
  }
  Agreed(): string {//calculates agreed
    return ((this.Review.agreed.length / (this.Review.agreed.length + this.Review.disagreed.length)) * 100) + "%"
  }
  Disagreed(): string {//calculates disagreed
    return ((this.Review.disagreed.length / (this.Review.agreed.length + this.Review.disagreed.length)) * 100) + "%"
  }
  GetTooltip(): string {//shows tooltip
    return "Agreed: " + this.Review.agreed.length + "\tDisagreed: " + this.Review.disagreed.length;
  }
  OpenPopup() {//opens opopup for response
    myExtObject.initPopup(this.ID);
  }
  ClosePopup() {//closes popup
    myExtObject.closePopup(this.ID);
  }
  UpdateDrop(value: number) {//sets the esponses the user will see
    this.selectedResponses = [];
    if (value != 99) {
      this.disabled = false;
      this.selectedResponses = this.responses[value].responses;
      this.selectedResponses = this.selectedResponses.filter(r => r.tier <= this.Home.tier);
    }
    else {
      this.disabled = true;
    }
  }
  showWarningLogIn() {//shows a toast
    this.toastr.warning('You must be logged in to judge a review.', 'Sorry!');
  }
  ngOnInit() {// on init if the home is of a low tier change the way the pop up works, to not have a cascading dropdown
    this.ID = "id" + this.Review.reviewID;
    if (this.Review.agreed == undefined) {
      this.Review.agreed = [];
    }
    if (this.Review.disagreed == undefined) {
      this.Review.disagreed = [];
    }
    this.selectedResponses = [];
    if (!this.CheckTier()) {
      this.disabled = false;
      this.responses.forEach(category => {
        category.responses.forEach(response => {
          if (response.tier <= this.Home.tier)
            this.selectedResponses.push(response);
        });
      });
    }
    else {
      this.disabled = true;
    }
    this.exampleIcon1 = this.genIcon();// random color to mock a user avatar
    this.exampleIcon2 = this.genIcon();// random color to mock a user avatar
  }

  modalRespondToReview(id: string){
    $('.ui.longer.modal.respond-to-review.'+id)
            .modal({
                inverted: true
            })
            .modal('show')
        ;
  }

  

}
