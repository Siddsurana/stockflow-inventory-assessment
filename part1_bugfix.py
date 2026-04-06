
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json
      
    required_fields = ['name', 'sku', 'price', 'warehouse_id', 'initial_quantity']
    if not all(field in data for field in required_fields):
        return {"error": "Missing required fields"}, 400
        
   try:
        
        product = Product(
            name=data['name'],
            sku=data['sku'],
            price=data['price'] 
        )
        db.session.add(product)
        db.session.flush() # Flushes to DB to get product.id, but DOES NOT commit yet
        
        inventory = Inventory(
            product_id=product.id,
            warehouse_id=data['warehouse_id'],
            quantity=data['initial_quantity']
        )
        db.session.add(inventory)
        
        db.session.commit()
        
        return {"message": "Product created successfully", "product_id": product.id}, 201
        
    except IntegrityError:
        db.session.rollback()
        return {"error": "A product with this SKU already exists"}, 409
    except Exception as e:
        db.session.rollback()
        return {"error": "An internal error occurred"}, 500
