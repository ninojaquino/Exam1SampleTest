import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlexModalService } from '../shared-components/flex-modal/flex-modal.service';
import { Http } from '@angular/http';
import { TemplatePortal } from '@angular/cdk/portal';

interface IOrder {
  pid: string;
  image: string;
  description: string;
  price: number;
  quantity: number;
}
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})

export class OrdersComponent implements OnInit {

  orders: Array<IOrder> = [];
  name = '';
  errorMessage = '';
  confirmMessage = '';
  constructor(
    private router: Router,
    private flexModal: FlexModalService,
    private http: Http
  ) {

  }

  async ngOnInit() {
    this.readFile();
  }

  // loadDefaultOrders() {
  //   this.orders = [{
  //     'pid': '1',
  //     'image': 'assets/sm_hotdog.jpeg',
  //     'description': 'Hot Dog',
  //     'price': 5.00,
  //     'quantity': 2
  //   }, {
  //     'pid': '2',
  //     'image': 'assets/sm_hamberger.jpeg',
  //     'description': 'Hamberger',
  //     'price': 6.00,
  //     'quantity': 1
  //   }, {
  //     'pid': '3',
  //     'image': 'assets/sm_pizza.jpeg',
  //     'description': 'Large Pizza',
  //     'price': 12.00,
  //     'quantity': 2
  //   }];
  // }

  // prepare result, splice last name, first name

  submit() {
    const commaIndex = this.name.indexOf(', ');
    let error = false;
    // validation for missing name
    if (this.name === '') {
      // console.log('Name must not be empty!');
      this.errorMessage = 'First Name, Last Name must be defined!';
      error = true;
      // validation for missing comma
    } else if (commaIndex === -1) {
      // console.log('Name must have a comma!');
      this.errorMessage = 'Name must have a comma!';
      error = true;
    }
    if (!error) {
      const firstName = this.name.slice(commaIndex + 1, this.name.length);
      const lastName = this.name.slice(0, commaIndex);
      const fullName = firstName + ' ' + lastName;
      const calculation = this.calculate();
      if (calculation.error) {
        this.errorMessage = calculation.error;
        this.flexModal.openDialog('error-modal');
      } else {
        this.confirmMessage = `Thank you for your order ${fullName}. Your sub total is:
        ${calculation.subTotal}. Your tax amount is ${calculation.taxAmount}. Your grand total is ${calculation.total}`;
       this.flexModal.openDialog('confirm-modal');
      }
      // confirm order
      // console.log('this.name', this.name 'commaIndex', commaIndex, 'firstName', firstName, 'lastName', lastName);
    } else {
      this.flexModal.openDialog('error-modal');
    }
  }


  // Calculate total and perform input validation

  calculate() {
    let hasError = false;
    const total = this.orders.reduce((inc, item, i, arr) => {
      if (item.quantity == null) {
        console.log('item.quantity', item.quantity);
        hasError = true;
      }
      inc += item.price * item.quantity;
      return inc;
    }, 0);

    if (hasError) {
      return {
        error: 'Quantity cannot be null'
      }
    } else {
      const taxAmount = total * .1;
      const subTotal = total - taxAmount;
      console.log('from calculate() total', total, 'taxAmount', taxAmount, 'subTotal', subTotal);
      return {
        total: total,
        taxAmount: taxAmount,
        subTotal: subTotal
      };
    }

  }

  // display the order form with orders from orders.json


  // Clear the orders form

  clear() {
    // this.orders = [];

    this.orders.forEach((item, i) => {
      console.log('item', item, 'i', i);
      item.price = null;
      item.quantity = null;

    });
  }

  // Add items 'Hot Dog', 'Hamberger' and 'Pizza' to list when corresponding button is clicked

  addItem(item: string) {
    switch (item) {
      case 'hot dog':
        this.orders.unshift({
          'pid': '1',
          'image': 'assets/sm_hotdog.jpeg',
          'description': 'Hot Dog',
          'price': 5.00,
          'quantity': null
        });
        break;
      case 'hamberger':
        this.orders.unshift({
          'pid': '2',
          'image': 'assets/sm_hamberger.jpeg',
          'description': 'Hamberger',
          'price': 6.00,
          'quantity': null
        });
        break;
      case 'pizza':
        this.orders.unshift({
          'pid': '3',
          'image': 'assets/sm_pizza.jpeg',
          'description': 'Large Pizza',
          'price': 12.00,
          'quantity': null
        });
        break;
    }
  }

  // delete line item (order) when delete button is click

  delete(index: number) {
    this.orders.splice(index, 1);
  }

  // read in the orders.json file and populate the list table with the initial orders (3)
  async readFile() {
    const rows = await this.http.get('assets/orders.json').toPromise();
    console.log('rows', rows.json);
    this.orders = rows.json();
    return rows.json();
  }
}
