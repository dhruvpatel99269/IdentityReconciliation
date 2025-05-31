// controllers/identityController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Contact from '../models/contactModel';
import { contactInputSchema } from '../middleware/contactValidation';

export const identifyContact = async (req: Request, res: Response) => {
  try {
    // ✅ Zod validation
    const parseResult = contactInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.format(),
      });
    }

    const { email, phoneNumber } = parseResult.data;
    console.log('Request body:', req.body);

    // Step 1: Find matching contacts by email or phoneNumber
    const matchingContacts = await Contact.find({
      $or: [{ email }, { phoneNumber }],
    });

    // Step 2: Collect all linked contacts
    const contactIds = new Set<string>();
    matchingContacts.forEach(c => {
      contactIds.add(c._id.toString());
      if (c.linkedId) contactIds.add(c.linkedId.toString());
    });

    const allContacts = await Contact.find({
      $or: [
        { _id: { $in: Array.from(contactIds) } },
        { linkedId: { $in: Array.from(contactIds) } },
      ],
    });

    // Step 3: If no contacts found, create new primary
    if (allContacts.length === 0) {
      const newPrimary = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });

      return res.status(200).json({
        contact: {
          primaryContactId: newPrimary._id,
          emails: [newPrimary.email],
          phoneNumbers: [newPrimary.phoneNumber],
          secondaryContactIds: [],
        },
      });
    }

    // Step 4: Determine oldest primary
    const primaryContacts = allContacts.filter(c => c.linkPrecedence === 'primary');
    const oldestPrimary = primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

    // Step 5: Update other primaries to secondary
    const updatePromises = allContacts.map(async (c) => {
      if (
        c._id.toString() !== oldestPrimary._id.toString() &&
        c.linkPrecedence === 'primary'
      ) {
        c.linkPrecedence = 'secondary';
        c.linkedId = oldestPrimary._id;
        await c.save();
      }
    });
    await Promise.all(updatePromises);

    // Step 6: Add new secondary if needed
    const emailsSet = new Set(allContacts.map(c => c.email).filter(Boolean));
    const phonesSet = new Set(allContacts.map(c => c.phoneNumber).filter(Boolean));

    if (!emailsSet.has(email) || !phonesSet.has(phoneNumber)) {
      const newSecondary = await Contact.create({
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: oldestPrimary._id,
      });
      allContacts.push(newSecondary);
      emailsSet.add(email);
      phonesSet.add(phoneNumber);
    }

    // Step 7: Prepare response
    const secondaryContactIds = allContacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c._id);

    const emails = [oldestPrimary.email, ...Array.from(emailsSet).filter(e => e !== oldestPrimary.email)];
    const phoneNumbers = [oldestPrimary.phoneNumber, ...Array.from(phonesSet).filter(p => p !== oldestPrimary.phoneNumber)];

    return res.status(200).json({
      contact: {
        primaryContactId: oldestPrimary._id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.error('Error in identifyContact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
