import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Home } from "../Home";
import { Review } from "../Review";
import { User } from "../User";
import { Image } from '../Image';
import { StorageService } from "../storage.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { AngularFireAuth } from 'angularfire2/auth';
import { v4 as uuid } from 'uuid';
import { FirebaseApp } from 'angularfire2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Lightbox } from 'angular2-lightbox';
import { OrderBy } from '../../OrderBy.pipe';
import 'script.js';

declare var myExtObject: any;
declare var $: any;

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {
  currentHome: Home;
  Reviews: Review[];
  newReview: Review;
  User: User;
  ratio: string;
  gcd: number;
  NumReviews: string;
  image: string;
  values: any[] = [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
    { id: 4, name: '4' },
    { id: 5, name: '5' }
  ];
  m: number[];//stores each score of a new review
  careTypes: string[];
  facilities: string[];
  i: number = 0;//iterator
  j: number = 0;//iterator
  url: SafeResourceUrl;


  //facilitie available
  facilitiesArray: string[] = [
    "Live-In Carers",
    "Chiropody",
    "Oratory",
    "Visiting Area",
    "Hairdressing",
    "Laundry",
    "Library",
    "WiFi",
    "Resident GP",
    "Dietician",
    "Dental Care",
    "Pool",
    "Garden",
    "Group Outings",
    "Bingo"
  ];

  //caretypes available
  caretypesArray = [
    "Alzheimer’s",
    "Cancer",
    "Hearing",
    "Speech",
    "Visual",
    "Residential",
    "Respite",
    "Convalescent",
    "Dementia",
    "Physiotherapy"
  ];

  //the icons (currently from semantic ui) to use for the caretypes.  String gets added to its class
  caretypeIcon = [
    'doctor', 'user', 'anchor', 'shower', 'space shuttle', 'wifi', 'users', 'building', 'github', 'rebel'
  ];

  //the icons (currently from semantic ui) to use for the facilities.  String gets added to its class
  facilityIcon = [
    'anchor', 'doctor', 'announcement', 'users', 'cut', 'diamond', 'book', 'wifi', 'doctor', 'food', 'smile', 'bath', 'tree', 'space shuttle', 'rebel'
  ];

  ctBool: boolean[] = [];
  fBool: boolean[] = [];

  _album: Array<any> = [];

  constructor(private afa: AngularFireAuth, private _lightbox: Lightbox, public sanitizer: DomSanitizer, private storageService: StorageService, private router: Router, private route: ActivatedRoute, public toastr: ToastsManager, vcr: ViewContainerRef, private firebaseApp: FirebaseApp) {
    this.toastr.setRootViewContainerRef(vcr);//sets the view container that the toasts will appear in
    this.Reviews = [];
    this.m = [3,3,3,3,3,3,3,3,3,3,3,3];//starts each new review score at 3
    for (let i = 1; i <= 16; i++) {
      const src = 'assets/big.jpg';
      const caption = 'Image ' + i + ' caption here';
      const thumb = 'assets/big.jpg';
      const album = {
        src: src,
        caption: caption,
        thumb: thumb
      };

      this._album.push(album);
    }
  }
  getLength(array:any[])
  {
    if(array!=undefined) return array.length;
    else return 0;
  }
  getCT() {
    this.currentHome.careTypes.forEach(ct => {
      this.ctBool[this.i] = ct.value == true ? true : false;
      this.i++;
    });
  }
  getFacilities() {
    this.currentHome.facilities.forEach(f => {
      this.fBool[this.j] = f.value == true ? true : false;
      this.j++;
    });
  }

  open(index: number): void {
    // open lightbox
    this._lightbox.open(this._album, index);
  }

  GetHome(id): void {//gets current home
    this.storageService.getCurrentHome(id).subscribe(home => {
      this.currentHome = home;
      this.url = '//www.google.com/maps/embed/v1/place?q=' + home.lat + ',' + home.long + '&zoom=14&key=AIzaSyCcprejw3C_TDbMoM1h_Gss2aWaWC4Av8w';
      this.GetReviews();
      this.getImage();
      this.getCT();
      this.getFacilities();
    });
  }
  getImage() {//get image from firebase storage, assign it to image variable
    const storageRef = this.firebaseApp.storage().ref().child(this.currentHome.images.path);
    storageRef.getDownloadURL().then(url => this.image = url);
  }
  GetReviews(): void {//gets the reviews associated with the current home
    this.Reviews = [];
    if (this.currentHome != null) {
      this.calculateRatio();
      for (var k in this.currentHome.reviews) {
        this.Reviews.push(this.currentHome.reviews[k]);
      }
      this.Reviews.forEach(element => {
        element.numAgreed=this.getLength(element.agreed);
        element.numDisagreed=this.getLength(element.disagreed);
      });
    }
  }
  calculateRatio(): void {//calculates the bed:staff ratio 
    this.gcd = this.GCD(parseFloat(this.currentHome.beds), parseFloat(this.currentHome.staff));
    this.ratio = parseFloat(this.currentHome.beds) / this.gcd + ":" + parseFloat(this.currentHome.staff)
  }
  GCD(a, b): number {//calculates the greatest common denominator
    while (a != 0 && b != 0) {
      if (a > b)
        a %= b;
      else
        b %= a;
    }
    if (a == 0)
      return b;
    else
      return a;
  }
  CheckHome() {//if the current home is not null it calls javascript to populate care ypes, facilities and initialise semantic ui tabs
    if (this.currentHome != null || this.currentHome != undefined) {
      myExtObject.PopulateCare(this.currentHome.careTypes);
      myExtObject.Populate(this.currentHome.facilities);
      myExtObject.InitTabs();
      return true;
    }
    else {//if the home is for some reason null it redirects back to the home page
      return false;
    }
  }
  //leaves a review, refreshes the list of reviews and informs the user that their review was left successfully 
  /*LeaveReview(criteria1, criteria2, criteria3, criteria4, criteria5, criteria6, criteria7, criteria8, criteria9, criteria10, criteria11, criteria12, comment) {
    if (this.User != null && this.User != undefined && criteria1 != "" && criteria2 != "" && criteria3 != "" && criteria4 != "" && criteria5 != "" && criteria6 != "" && criteria7 != "" && criteria8 != "" && criteria9 != "" && criteria10 != "" && criteria11 != "" && criteria12 != "" && comment != "") {
      this.newReview = new Review(uuid(), this.User.name, criteria1, criteria2, criteria3, criteria4, criteria5, criteria6, criteria7, criteria8, criteria9, criteria10, criteria11, criteria12, Math.round((parseFloat(criteria1) + parseFloat(criteria2) + parseFloat(criteria3) + parseFloat(criteria4) + parseFloat(criteria5) + parseFloat(criteria6) + parseFloat(criteria7) + parseFloat(criteria8) + parseFloat(criteria9) + parseFloat(criteria10) + parseFloat(criteria11) + parseFloat(criteria12)) / 12), comment, [],0, [],0, "");
      this.storageService.UpdateReviews(this.currentHome, this.newReview);
      this.GetReviews();
      myExtObject.Clear();
      this.showSuccess();
    }
    else if (this.User == null || this.User == undefined) {//shows a toast asking the user to log in
      this.showWarningLogIn();
    }
    else {//shows a toast informing the user that they need to fill out the fields
      this.showWarningContent();
    }
  }*/
  LeaveReview(comment){//leaves a review, refreshes the list of reviews and informs the user that their review was left successfully 
    if(this.User != null && this.User != undefined && comment != ''){
      this.newReview = new Review(uuid(), this.User.name, this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5], this.m[6], this.m[7], this.m[8], this.m[9], this.m[10], this.m[11], Math.round( this.AddScores() / 12), comment, [],0, [],0, "" );
      this.storageService.UpdateReviews(this.currentHome, this.newReview);
      this.GetReviews();
      myExtObject.Clear();
      this.showSuccess();
    }else if (this.User == null || this.User == undefined) {//shows a toast asking the user to log in
      this.showWarningLogIn();
    }else {//shows a toast informing the user that they need to fill out the fields
      this.showWarningContent();
    }
  }
  AddScores(){//adds scores left on a new review
    var val = 0;
    for (let index = 0; index < this.m.length; index++) {
      val += this.m[index]
    }
    return val;
  }
  GetUser(): void {//gets current user
    this.afa.authState.subscribe((resp) => {
      if (resp != null) {
        if (resp.uid) {
          this.storageService.getUser(resp.uid).subscribe(user => {
            this.User = user;
          });
        }
      }
    });
  }
  SortReviews(Reviews: Review[]): Review[] {//sorts the reviews by agreed-nees work
    switch (Reviews) {
      default:
        Reviews.sort((a, b) => {
          if (a.agreed.length > b.agreed.length) return -1;
          else if (a.agreed.length < b.agreed.length) return 1;
          else return 0;
        });
        return Reviews
    }
  }
  showSuccess() {//shows a toast
    this.toastr.success('Your review was left succesfully!', 'Thanks!');
  }
  showWarningLogIn() {//shows a toast
    this.toastr.warning('You must be logged in to leave a review.', 'Sorry!');
  }
  showWarningContent() {//shows a toast
    this.toastr.warning('You must fill out all of the fields.', 'Sorry!');
  }
  UpdateCurrentHome() {//updates the current home when one is clicked on
    this.router.navigate(["/webSide/contact"], { queryParams: { id: this.currentHome.ID } });//navigates to the details page and sets the queryParams
  }
  ngOnInit() {
    this.GetUser();
    this.route.queryParams//gets the id of the current home from the queryParams
      .filter(params => params.id)
      .subscribe(params => {
        if (params['id']) {
          this.GetHome(params.id);//gets the home based on the id from the queryParam
        }
      });
    myExtObject.initFullpage("not home");//tells the full page plugin not to fire on this page
  }

  CheckRating(rating: number): string {//displays stars
    if (this.currentHome.rating >= rating) return "yellow star icon"
    else if (this.currentHome.rating <= rating - 1 || this.currentHome.rating == null || this.currentHome.rating == undefined) return "empty yellow star icon"
    else return "yellow star half empty icon"
  }

  checkHomeReviews() {//checks the home isn't null
    if (this.currentHome != null) {
      this.UpdateNumReviews();
      return true
    }
    else return false
  }

  UpdateNumReviews() {//updates the number of reviews
    this.Reviews = [];
    for (var k in this.currentHome.reviews) {
      this.Reviews.push(this.currentHome.reviews[k]);
    }
    if (this.Reviews.length > 1 || this.Reviews.length == 0)
      this.NumReviews = this.Reviews.length + " reviews";
    else this.NumReviews = this.Reviews.length + " review";
  }

}
